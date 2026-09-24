// Cópia de segurança: salva todas as tabelas num arquivo JSON em backups/.
// Rodar com `npm run backup`. Com TURSO_DATABASE_URL no ambiente, faz o backup do banco da nuvem.
// Para restaurar: `npm run copiar-banco -- --de backups/<arquivo>.json --para <destino>`.
require('dotenv').config({ quiet: true });
const fs = require('fs');
const path = require('path');
const db = require('./db');

const TABELAS = ['usuarios', 'categorias', 'eventos', 'participantes', 'inscricoes', 'mensagens'];

async function main() {
  const dados = { criado_em: new Date().toISOString(), tabelas: {} };
  for (const tabela of TABELAS) {
    dados.tabelas[tabela] = await db.consultar(`SELECT * FROM ${tabela} ORDER BY id`);
  }

  const pasta = path.join(__dirname, '..', 'backups');
  fs.mkdirSync(pasta, { recursive: true });
  // Nome do arquivo no horário local (toISOString sozinho daria o horário UTC, 3 h à frente).
  const agora = new Date();
  const local = new Date(agora.getTime() - agora.getTimezoneOffset() * 60000);
  const carimbo = local.toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const arquivo = path.join(pasta, `backup-${carimbo}.json`);
  fs.writeFileSync(arquivo, JSON.stringify(dados, null, 2));

  const resumo = TABELAS.map((t) => `${t}: ${dados.tabelas[t].length}`).join(', ');
  console.log(`Backup salvo em ${path.relative(process.cwd(), arquivo)} (${resumo}).`);
}

main()
  .catch((erro) => { console.error(erro.message); process.exitCode = 1; })
  .finally(() => db.fechar());
