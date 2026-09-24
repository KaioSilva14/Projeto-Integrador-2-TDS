const db = require('../db');

function listar() {
  return db.prepare('SELECT id, nome FROM categorias ORDER BY nome').all();
}

// Para a tela de categorias: cada uma com quantos eventos a usam (RN05).
function listarComTotal() {
  return db.prepare(`
    SELECT c.id, c.nome, COUNT(e.id) AS total_eventos
      FROM categorias c
      LEFT JOIN eventos e ON e.categoria_id = c.id
     GROUP BY c.id
     ORDER BY c.nome
  `).all();
}

function buscarPorId(id) {
  return db.prepare('SELECT id, nome FROM categorias WHERE id = ?').get(id);
}

// NOCASE: "palestra" e "Palestra" contam como o mesmo nome.
function buscarPorNome(nome) {
  return db.prepare('SELECT id, nome FROM categorias WHERE nome = ? COLLATE NOCASE').get(nome);
}

function criar(nome) {
  return db.prepare('INSERT INTO categorias (nome) VALUES (?)').run(nome).lastInsertRowid;
}

function contarEventos(id) {
  return db.prepare('SELECT COUNT(*) AS total FROM eventos WHERE categoria_id = ?').get(id).total;
}

function excluir(id) {
  db.prepare('DELETE FROM categorias WHERE id = ?').run(id);
}

module.exports = { listar, listarComTotal, buscarPorId, buscarPorNome, criar, contarEventos, excluir };
