// Mensagens enviadas pela página de contato.
const db = require('../db');

async function criar({ nome, email, assunto, mensagem }) {
  return (await db.executar(
    'INSERT INTO mensagens (nome, email, assunto, mensagem) VALUES (?, ?, ?, ?)',
    [nome, email, assunto, mensagem])).id;
}

// Não lidas primeiro, depois as mais recentes. criado_em é UTC; 'localtime' converte.
function listar() {
  return db.consultar(`
    SELECT id, nome, email, assunto, mensagem, lida,
           datetime(criado_em, 'localtime') AS criado_em
      FROM mensagens
     ORDER BY lida, id DESC
  `);
}

async function contarNaoLidas() {
  return (await db.obter('SELECT COUNT(*) AS total FROM mensagens WHERE lida = 0')).total;
}

async function alternarLida(id) {
  return (await db.executar('UPDATE mensagens SET lida = 1 - lida WHERE id = ?', [id])).alteradas > 0;
}

async function excluir(id) {
  return (await db.executar('DELETE FROM mensagens WHERE id = ?', [id])).alteradas > 0;
}

module.exports = { criar, listar, contarNaoLidas, alternarLida, excluir };
