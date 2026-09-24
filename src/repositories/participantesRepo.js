const db = require('../db');

// O e-mail identifica a pessoa (UNIQUE) e chega aqui já em minúsculas.
// `acesso` permite usar estas funções dentro de uma transação (padrão: banco direto).
function buscarPorEmail(email, acesso = db) {
  return acesso.obter('SELECT id, nome, email, turma FROM participantes WHERE email = ?', [email]);
}

async function criar({ nome, email, turma }, acesso = db) {
  const resultado = await acesso.executar(
    'INSERT INTO participantes (nome, email, turma) VALUES (?, ?, ?)', [nome, email, turma]);
  return resultado.id;
}

module.exports = { buscarPorEmail, criar };
