const db = require('../db');

function listar() {
  return db.prepare('SELECT id, nome FROM categorias ORDER BY nome').all();
}

module.exports = { listar };
