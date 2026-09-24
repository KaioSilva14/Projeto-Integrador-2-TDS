const db = require('../db');

// Colunas comuns às consultas de evento.
// vagas_ocupadas é calculada pelo COUNT (não existe coluna para isso — CLAUDE.md, seção 5.2).
// inscricoes_encerradas junta as duas condições da RN03 num lugar só.
const COLUNAS = `
  e.id, e.titulo, e.descricao, e.categoria_id, e.data_evento, e.hora_inicio, e.hora_fim,
  e.local, e.capacidade, e.status,
  c.nome AS categoria,
  COUNT(i.id) AS vagas_ocupadas,
  (e.status = 'encerrado' OR e.data_evento < date('now', 'localtime')) AS inscricoes_encerradas`;

const JUNCOES = `
  FROM eventos e
  JOIN categorias c ON c.id = e.categoria_id
  LEFT JOIN inscricoes i ON i.evento_id = e.id`;

// Eventos que ainda aceitam inscrição: status 'aberto' e data de hoje em diante.
function listarAbertos(categoriaId) {
  let sql = `SELECT ${COLUNAS} ${JUNCOES}
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

// Painel: todos os eventos, os próximos primeiro e os que já passaram no fim.
function listarTodos() {
  return db.prepare(`SELECT ${COLUNAS} ${JUNCOES}
     GROUP BY e.id
     ORDER BY e.data_evento < date('now', 'localtime'), e.data_evento, e.hora_inicio`).all();
}

function buscarPorId(id) {
  return db.prepare(`SELECT ${COLUNAS} ${JUNCOES} WHERE e.id = ? GROUP BY e.id`).get(id);
}

function criar(dados) {
  return db.prepare(`
    INSERT INTO eventos (titulo, descricao, categoria_id, data_evento, hora_inicio, hora_fim, local, capacidade)
    VALUES (@titulo, @descricao, @categoria_id, @data_evento, @hora_inicio, @hora_fim, @local, @capacidade)
  `).run(paraBanco(dados)).lastInsertRowid;
}

function atualizar(id, dados) {
  db.prepare(`
    UPDATE eventos
       SET titulo = @titulo, descricao = @descricao, categoria_id = @categoria_id,
           data_evento = @data_evento, hora_inicio = @hora_inicio, hora_fim = @hora_fim,
           local = @local, capacidade = @capacidade, status = @status
     WHERE id = @id
  `).run({ ...paraBanco(dados), id });
}

// As inscrições do evento somem junto (ON DELETE CASCADE — RN04).
function excluir(id) {
  db.prepare('DELETE FROM eventos WHERE id = ?').run(id);
}

// Números do painel do organizador.
function resumo() {
  return db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM eventos
        WHERE status = 'aberto' AND data_evento >= date('now', 'localtime')) AS eventos_abertos,
      (SELECT COUNT(*) FROM eventos) AS eventos_total,
      (SELECT COUNT(*) FROM inscricoes) AS inscricoes_total,
      (SELECT COUNT(*) FROM inscricoes WHERE presenca_confirmada = 1) AS presencas_total
  `).get();
}

// Campos opcionais vazios viram NULL no banco; status só existe na edição.
function paraBanco(dados) {
  return {
    titulo: dados.titulo,
    descricao: dados.descricao || null,
    categoria_id: dados.categoria_id,
    data_evento: dados.data_evento,
    hora_inicio: dados.hora_inicio,
    hora_fim: dados.hora_fim || null,
    local: dados.local,
    capacidade: dados.capacidade,
    status: dados.status || 'aberto',
  };
}

module.exports = { listarAbertos, listarTodos, buscarPorId, criar, atualizar, excluir, resumo };
