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
async function inscrever(eventoId, { nome, email, turma }) {
  try {
    return await db.transacao(async (tx) => {
      const evento = await tx.obter(`
        SELECT id, capacidade,
               (status = 'encerrado' OR data_evento < date('now', 'localtime')) AS encerrado
          FROM eventos WHERE id = ?
      `, [eventoId]);

      if (!evento) return { erro: MENSAGENS.naoEncontrado };
      if (evento.encerrado) return { erro: MENSAGENS.encerrado };

      const jaInscrito = await tx.obter(`
        SELECT 1 AS sim
          FROM inscricoes i
          JOIN participantes p ON p.id = i.participante_id
         WHERE i.evento_id = ? AND p.email = ?
      `, [eventoId, email]);
      if (jaInscrito) return { erro: MENSAGENS.duplicada };

      const { total } = await tx.obter('SELECT COUNT(*) AS total FROM inscricoes WHERE evento_id = ?', [eventoId]);
      if (total >= evento.capacidade) return { erro: MENSAGENS.esgotado };

      // Mesmo e-mail em outro evento = mesma pessoa: reaproveita o cadastro (CLAUDE.md, seção 5.2).
      const participante = await participantesRepo.buscarPorEmail(email, tx);
      const participanteId = participante
        ? participante.id
        : await participantesRepo.criar({ nome, email, turma }, tx);

      const resultado = await tx.executar(
        'INSERT INTO inscricoes (evento_id, participante_id) VALUES (?, ?)', [eventoId, participanteId]);
      return { inscricaoId: resultado.id };
    });
  } catch (erro) {
    // Segunda linha de defesa: a UNIQUE do banco barrou uma duplicidade que passou pela checagem.
    if (String(erro.code || erro.message).includes('SQLITE_CONSTRAINT')) return { erro: MENSAGENS.duplicada };
    throw erro;
  }
}

// data_inscricao é gravada em UTC (CURRENT_TIMESTAMP); 'localtime' converte para o horário daqui.
function listarPorEvento(eventoId) {
  return db.consultar(`
    SELECT i.id, p.nome, p.email, p.turma, i.presenca_confirmada,
           datetime(i.data_inscricao, 'localtime') AS data_inscricao
      FROM inscricoes i
      JOIN participantes p ON p.id = i.participante_id
     WHERE i.evento_id = ?
     ORDER BY p.nome COLLATE NOCASE
  `, [eventoId]);
}

// Inverte presente ↔ ausente e devolve o evento da inscrição (para voltar à lista certa).
async function alternarPresenca(id) {
  const inscricao = await db.obter('SELECT evento_id FROM inscricoes WHERE id = ?', [id]);
  if (!inscricao) return null;
  await db.executar('UPDATE inscricoes SET presenca_confirmada = 1 - presenca_confirmada WHERE id = ?', [id]);
  return inscricao.evento_id;
}

// Remove uma inscrição (cancelamento pedido pelo aluno) e devolve o evento dela, ou null.
async function excluir(id) {
  const inscricao = await db.obter('SELECT evento_id FROM inscricoes WHERE id = ?', [id]);
  if (!inscricao) return null;
  await db.executar('DELETE FROM inscricoes WHERE id = ?', [id]);
  return inscricao.evento_id;
}

function recentes(limite) {
  return db.consultar(`
    SELECT i.id, p.nome, p.turma, e.id AS evento_id, e.titulo,
           datetime(i.data_inscricao, 'localtime') AS data_inscricao
      FROM inscricoes i
      JOIN participantes p ON p.id = i.participante_id
      JOIN eventos e ON e.id = i.evento_id
     ORDER BY i.id DESC
     LIMIT ?
  `, [limite]);
}

module.exports = { inscrever, listarPorEvento, alternarPresenca, excluir, recentes };
