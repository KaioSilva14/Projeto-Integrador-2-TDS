const db = require('../db');

// Eventos que ainda aceitam inscrição: status 'aberto' e data de hoje em diante.
// vagas_ocupadas é calculada pelo COUNT (não existe coluna para isso — CLAUDE.md, seção 5.2).
function listarAbertos(categoriaId) {
  let sql = `
    SELECT e.id, e.titulo, e.data_evento, e.hora_inicio, e.local, e.capacidade,
           c.nome AS categoria,
           COUNT(i.id) AS vagas_ocupadas
      FROM eventos e
      JOIN categorias c ON c.id = e.categoria_id
      LEFT JOIN inscricoes i ON i.evento_id = e.id
     WHERE e.status = 'aberto'
       AND e.data_evento >= date('now', 'localtime')`;
  const parametros = [];

  if (categoriaId) {
    sql += ' AND e.categoria_id = ?';
    parametros.push(categoriaId);
  }

  sql += ' GROUP BY e.id ORDER BY e.data_evento, e.hora_inicio';
  return db.prepare(sql).all(...parametros);
}

module.exports = { listarAbertos };
