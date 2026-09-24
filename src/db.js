// Conexão única com o banco SQLite. Todos os repositories importam este arquivo.
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// DB_PATH vem do .env; caminho relativo é resolvido a partir da raiz do projeto.
const raizProjeto = path.join(__dirname, '..');
const caminhoBanco = path.resolve(raizProjeto, process.env.DB_PATH || 'data/eventos.db');
fs.mkdirSync(path.dirname(caminhoBanco), { recursive: true });
const db = new Database(caminhoBanco);

// O SQLite vem com chaves estrangeiras desligadas; sem isto o ON DELETE CASCADE não funciona.
db.pragma('foreign_keys = ON');

// Cria as tabelas que ainda não existem.
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

module.exports = db;
