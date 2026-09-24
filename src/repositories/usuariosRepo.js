const db = require('../db');

function buscarPorEmail(email) {
  return db.prepare('SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ?').get(email);
}

module.exports = { buscarPorEmail };
