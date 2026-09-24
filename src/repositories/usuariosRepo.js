const db = require('../db');

function buscarPorEmail(email) {
  return db.obter('SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ?', [email]);
}

module.exports = { buscarPorEmail };
