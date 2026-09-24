const db = require('../db');

// O e-mail identifica a pessoa (UNIQUE) e chega aqui já em minúsculas.
function buscarPorEmail(email) {
  return db.prepare('SELECT id, nome, email, turma FROM participantes WHERE email = ?').get(email);
}

function criar({ nome, email, turma }) {
  return db.prepare('INSERT INTO participantes (nome, email, turma) VALUES (?, ?, ?)')
    .run(nome, email, turma).lastInsertRowid;
}

module.exports = { buscarPorEmail, criar };
