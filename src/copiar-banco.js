// Copia TODOS os dados de um banco para outro, mantendo os ids.
// Uso principal: levar o banco do seu computador para o Turso na hora de colocar o site no ar.
//
//   npm run copiar-banco -- --de data/eventos.db --para libsql://seu-banco.turso.io
//   npm run copiar-banco -- --de backups/backup-2026-10-01.json --para data/eventos.db   (restaurar backup)
//
// O token do Turso vem de TURSO_AUTH_TOKEN. O destino precisa estar vazio (sem eventos),
// a não ser que você passe --substituir (apaga o que houver lá antes de copiar).
// Tudo é gravado numa única transação: se algo falhar no meio, nada muda no destino.
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@libsql/client');

// Ordem importa: tabelas "pai" antes das "filhas" por causa das chaves estrangeiras.
const TABELAS = ['usuarios', 'categorias', 'eventos', 'participantes', 'inscricoes', 'mensagens'];

function argumento(nome) {
  const i = process.argv.indexOf(nome);
  return i > -1 ? process.argv[i + 1] : undefined;
}

function conectar(alvo) {
  const ehRemoto = /^(libsql|https?|wss?):\/\//.test(alvo);
  return createClient({
    url: ehRemoto ? alvo : 'file:' + path.resolve(alvo),
    authToken: ehRemoto ? process.env.TURSO_AUTH_TOKEN : undefined,
  });
}

async function lerOrigem(origem) {
  if (origem.endsWith('.json')) {
    return JSON.parse(fs.readFileSync(origem, 'utf8')).tabelas;
  }
  if (!/^(libsql|https?|wss?):\/\//.test(origem) && !fs.existsSync(origem)) {
    throw new Error(`Arquivo de origem não encontrado: ${origem}`);
  }
  const cliente = conectar(origem);
  const tabelas = {};
  for (const tabela of TABELAS) {
    try {
      const r = await cliente.execute(`SELECT * FROM ${tabela} ORDER BY id`);
      tabelas[tabela] = r.rows.map((linha) => Object.fromEntries(r.columns.map((c, i) => [c, linha[i]])));
    } catch (erro) {
      if (/no such table/.test(erro.message)) tabelas[tabela] = []; // banco antigo, sem a tabela
      else throw erro;
    }
  }
  cliente.close();
  return tabelas;
}

async function main() {
  const origem = argumento('--de');
  const destino = argumento('--para');
  if (!origem || !destino) {
    throw new Error('Uso: npm run copiar-banco -- --de <origem> --para <destino> [--substituir]');
  }

  const tabelas = await lerOrigem(origem);
  const alvo = conectar(destino);

  // Garante que as tabelas existem no destino.
  await alvo.executeMultiple(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

  const { rows } = await alvo.execute('SELECT COUNT(*) AS n FROM eventos');
  const substituir = process.argv.includes('--substituir');
  if (Number(rows[0].n) > 0 && !substituir) {
    throw new Error(`O destino já tem ${rows[0].n} evento(s). Para apagar e substituir, rode de novo com --substituir.`);
  }

  const comandos = [];
  if (substituir) {
    for (const tabela of [...TABELAS].reverse()) comandos.push(`DELETE FROM ${tabela}`);
  }
  for (const tabela of TABELAS) {
    for (const linha of tabelas[tabela] || []) {
      const colunas = Object.keys(linha);
      comandos.push({
        sql: `INSERT INTO ${tabela} (${colunas.join(', ')}) VALUES (${colunas.map(() => '?').join(', ')})`,
        args: colunas.map((c) => linha[c]),
      });
    }
  }

  await alvo.batch(comandos, 'write'); // uma transação só
  alvo.close();

  const resumo = TABELAS.map((t) => `${t}: ${(tabelas[t] || []).length}`).join(', ');
  console.log(`Copiado de ${origem} para ${destino} (${resumo}).`);
}

main().catch((erro) => { console.error(erro.message); process.exitCode = 1; });
