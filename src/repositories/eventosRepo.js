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
  return db.consultar(sql, parametros);
}

// Painel: todos os eventos, os próximos primeiro e os que já passaram no fim.
function listarTodos() {
  return db.consultar(`SELECT ${COLUNAS} ${JUNCOES}
     GROUP BY e.id
     ORDER BY e.data_evento < date('now', 'localtime'), e.data_evento, e.hora_inicio`);
}

function buscarPorId(id) {
  return db.obter(`SELECT ${COLUNAS} ${JUNCOES} WHERE e.id = ? GROUP BY e.id`, [id]);
}

async function criar(dados) {
  const d = paraBanco(dados);
  const resultado = await db.executar(`
    INSERT INTO eventos (titulo, descricao, categoria_id, data_evento, hora_inicio, hora_fim, local, capacidade)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [d.titulo, d.descricao, d.categoria_id, d.data_evento, d.hora_inicio, d.hora_fim, d.local, d.capacidade]);
  return resultado.id;
}

async function atualizar(id, dados) {
  const d = paraBanco(dados);
  await db.executar(`
    UPDATE eventos
       SET titulo = ?, descricao = ?, categoria_id = ?, data_evento = ?, hora_inicio = ?,
           hora_fim = ?, local = ?, capacidade = ?, status = ?
     WHERE id = ?
  `, [d.titulo, d.descricao, d.categoria_id, d.data_evento, d.hora_inicio, d.hora_fim, d.local, d.capacidade, d.status, id]);
}

// RN04: apaga as inscrições e o evento juntos, numa transação.
// O ON DELETE CASCADE do schema continua lá como segunda defesa.
async function excluir(id) {
  await db.transacao(async (tx) => {
    await tx.executar('DELETE FROM inscricoes WHERE evento_id = ?', [id]);
    await tx.executar('DELETE FROM eventos WHERE id = ?', [id]);
  });
}

// Números do painel do organizador.
function resumo() {
  return db.obter(`
    SELECT
      (SELECT COUNT(*) FROM eventos
        WHERE status = 'aberto' AND data_evento >= date('now', 'localtime')) AS eventos_abertos,
      (SELECT COUNT(*) FROM eventos) AS eventos_total,
      (SELECT COUNT(*) FROM inscricoes) AS inscricoes_total,
      (SELECT COUNT(*) FROM inscricoes WHERE presenca_confirmada = 1) AS presencas_total,
      (SELECT COUNT(*) FROM mensagens WHERE lida = 0) AS mensagens_novas
  `);
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
