const db = require('../db');
const participantesRepo = require('./participantesRepo');

const MENSAGENS = {
  naoEncontrado: 'Evento não encontrado.',
  encerrado: 'As inscrições para este evento estão encerradas.', // RN03
  duplicada: 'Este e-mail já está inscrito neste evento.', // RN02
  esgotado: 'As vagas deste evento esgotaram.', // RN01
};

// Tudo dentro de uma transação: entre contar as vagas e gravar, ninguém mais grava (RN01).
// Devolve { inscricaoId } quando dá certo ou { erro } com a mensagem para o usuário.
const inscreverNaTransacao = db.transaction((eventoId, { nome, email, turma }) => {
  const evento = db.prepare(`
    SELECT id, capacidade,
           (status = 'encerrado' OR data_evento < date('now', 'localtime')) AS encerrado
      FROM eventos WHERE id = ?
  `).get(eventoId);

  if (!evento) return { erro: MENSAGENS.naoEncontrado };
  if (evento.encerrado) return { erro: MENSAGENS.encerrado };

  const jaInscrito = db.prepare(`
    SELECT 1
      FROM inscricoes i
      JOIN participantes p ON p.id = i.participante_id
     WHERE i.evento_id = ? AND p.email = ?
  `).get(eventoId, email);
  if (jaInscrito) return { erro: MENSAGENS.duplicada };

  const { total } = db.prepare('SELECT COUNT(*) AS total FROM inscricoes WHERE evento_id = ?').get(eventoId);
  if (total >= evento.capacidade) return { erro: MENSAGENS.esgotado };

  // Mesmo e-mail em outro evento = mesma pessoa: reaproveita o cadastro (CLAUDE.md, seção 5.2).
  const participante = participantesRepo.buscarPorEmail(email);
  const participanteId = participante ? participante.id : participantesRepo.criar({ nome, email, turma });

  const resultado = db.prepare('INSERT INTO inscricoes (evento_id, participante_id) VALUES (?, ?)')
    .run(eventoId, participanteId);
  return { inscricaoId: resultado.lastInsertRowid };
});

function inscrever(eventoId, dados) {
  try {
    return inscreverNaTransacao(eventoId, dados);
  } catch (erro) {
    // Segunda linha de defesa: a UNIQUE do banco barrou uma duplicidade que passou pela checagem.
    if (erro.code === 'SQLITE_CONSTRAINT_UNIQUE') return { erro: MENSAGENS.duplicada };
    throw erro;
  }
}

// data_inscricao é gravada em UTC (CURRENT_TIMESTAMP); 'localtime' converte para o horário daqui.
function listarPorEvento(eventoId) {
  return db.prepare(`
    SELECT i.id, p.nome, p.email, p.turma, i.presenca_confirmada,
           datetime(i.data_inscricao, 'localtime') AS data_inscricao
      FROM inscricoes i
      JOIN participantes p ON p.id = i.participante_id
     WHERE i.evento_id = ?
     ORDER BY p.nome COLLATE NOCASE
  `).all(eventoId);
}

// Inverte presente ↔ ausente e devolve o evento da inscrição (para voltar à lista certa).
function alternarPresenca(id) {
  const inscricao = db.prepare('SELECT evento_id FROM inscricoes WHERE id = ?').get(id);
  if (!inscricao) return null;
  db.prepare('UPDATE inscricoes SET presenca_confirmada = 1 - presenca_confirmada WHERE id = ?').run(id);
  return inscricao.evento_id;
}

function recentes(limite) {
  return db.prepare(`
    SELECT i.id, p.nome, p.turma, e.id AS evento_id, e.titulo,
           datetime(i.data_inscricao, 'localtime') AS data_inscricao
      FROM inscricoes i
      JOIN participantes p ON p.id = i.participante_id
      JOIN eventos e ON e.id = i.evento_id
     ORDER BY i.id DESC
     LIMIT ?
  `).all(limite);
}

module.exports = { inscrever, listarPorEvento, alternarPresenca, recentes };
