// Conexão com o banco. Todos os repositories usam as funções exportadas aqui.
//
// - No seu computador: arquivo SQLite local (DB_PATH, padrão data/eventos.db).
// - Na Vercel: banco Turso (SQLite na nuvem), via TURSO_DATABASE_URL e TURSO_AUTH_TOKEN.
//   O disco da Vercel é apagado a cada deploy, então lá o arquivo local NUNCA é usado.
const path = require('path');
const fs = require('fs');
const { createClient } = require('@libsql/client');

function urlDoBanco() {
  if (process.env.TURSO_DATABASE_URL) return process.env.TURSO_DATABASE_URL;
  if (process.env.VERCEL) {
    // Melhor parar com erro claro do que gravar num arquivo temporário e perder os dados.
    throw new Error('TURSO_DATABASE_URL não configurada na Vercel. Veja o README, seção "Colocar no ar".');
  }
  const raizProjeto = path.join(__dirname, '..');
  const caminho = path.resolve(raizProjeto, process.env.DB_PATH || 'data/eventos.db');
  fs.mkdirSync(path.dirname(caminho), { recursive: true });
  return 'file:' + caminho;
}

const cliente = createClient({
  url: urlDoBanco(),
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Cria as tabelas que ainda não existem — uma vez por inicialização do servidor.
let preparacao;
function preparar() {
  if (!preparacao) {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    preparacao = (async () => {
      await cliente.execute('PRAGMA foreign_keys = ON');
      await cliente.executeMultiple(schema);
    })();
    preparacao.catch(() => { preparacao = null; }); // se falhar, tenta de novo na próxima requisição
  }
  return preparacao;
}

// O libsql devolve linhas num formato próprio; aqui viram objetos comuns { coluna: valor }.
function paraObjetos(resultado) {
  return resultado.rows.map((linha) =>
    Object.fromEntries(resultado.columns.map((coluna, i) => [coluna, linha[i]])));
}

// As mesmas três funções servem para o banco direto e para dentro de uma transação.
function criarAcesso(executor) {
  return {
    // Várias linhas: [{...}, {...}]
    async consultar(sql, args = []) {
      return paraObjetos(await executor.execute({ sql, args }));
    },
    // Uma linha ou undefined
    async obter(sql, args = []) {
      return paraObjetos(await executor.execute({ sql, args }))[0];
    },
    // INSERT/UPDATE/DELETE: devolve o id criado e quantas linhas mudaram
    async executar(sql, args = []) {
      const r = await executor.execute({ sql, args });
      return { id: r.lastInsertRowid === undefined ? null : Number(r.lastInsertRowid), alteradas: r.rowsAffected };
    },
  };
}

const acessoDireto = criarAcesso(cliente);

const db = {
  async consultar(sql, args) { await preparar(); return acessoDireto.consultar(sql, args); },
  async obter(sql, args) { await preparar(); return acessoDireto.obter(sql, args); },
  async executar(sql, args) { await preparar(); return acessoDireto.executar(sql, args); },

  // Roda `fn` numa transação de escrita: ou tudo é gravado, ou nada (commit/rollback).
  async transacao(fn) {
    await preparar();
    const tx = await cliente.transaction('write');
    try {
      const resultado = await fn(criarAcesso(tx));
      await tx.commit();
      return resultado;
    } catch (erro) {
      await tx.rollback();
      throw erro;
    } finally {
      tx.close();
    }
  },

  preparar,
  fechar: () => cliente.close(),
};

module.exports = db;
