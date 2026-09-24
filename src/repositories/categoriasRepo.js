const db = require('../db');

function listar() {
  return db.consultar('SELECT id, nome FROM categorias ORDER BY nome');
}

// Para a tela de categorias: cada uma com quantos eventos a usam (RN05).
function listarComTotal() {
  return db.consultar(`
    SELECT c.id, c.nome, COUNT(e.id) AS total_eventos
      FROM categorias c
      LEFT JOIN eventos e ON e.categoria_id = c.id
     GROUP BY c.id
     ORDER BY c.nome
  `);
}

function buscarPorId(id) {
  return db.obter('SELECT id, nome FROM categorias WHERE id = ?', [id]);
}

// NOCASE: "palestra" e "Palestra" contam como o mesmo nome.
function buscarPorNome(nome) {
  return db.obter('SELECT id, nome FROM categorias WHERE nome = ? COLLATE NOCASE', [nome]);
}

async function criar(nome) {
  return (await db.executar('INSERT INTO categorias (nome) VALUES (?)', [nome])).id;
}

async function contarEventos(id) {
  return (await db.obter('SELECT COUNT(*) AS total FROM eventos WHERE categoria_id = ?', [id])).total;
}

async function excluir(id) {
  await db.executar('DELETE FROM categorias WHERE id = ?', [id]);
}

module.exports = { listar, listarComTotal, buscarPorId, buscarPorNome, criar, contarEventos, excluir };
