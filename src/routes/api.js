// API JSON somente leitura (CLAUDE.md, seção 6.4).
const express = require('express');
const eventosRepo = require('../repositories/eventosRepo');
const inscricoesRepo = require('../repositories/inscricoesRepo');
const requireAuth = require('../middlewares/requireAuth');
const assincrona = require('../middlewares/assincrona');
const { lerId } = require('../validacoes');

const router = express.Router();

// Formato público de um evento: sem dados de alunos, com as vagas já calculadas.
function eventoParaJson(e) {
  return {
    id: e.id,
    titulo: e.titulo,
    descricao: e.descricao,
    categoria: e.categoria,
    data: e.data_evento,
    hora_inicio: e.hora_inicio,
    hora_fim: e.hora_fim,
    local: e.local,
    capacidade: e.capacidade,
    vagas_ocupadas: e.vagas_ocupadas,
    vagas_restantes: Math.max(e.capacidade - e.vagas_ocupadas, 0),
    status: e.status,
    aceita_inscricoes: !e.inscricoes_encerradas && e.vagas_ocupadas < e.capacidade,
  };
}

const carregarEvento = assincrona(async (req, res, next) => {
  const id = lerId(req.params.id);
  const evento = id && await eventosRepo.buscarPorId(id);
  if (!evento) return res.status(404).json({ erro: 'Evento não encontrado.' });
  req.evento = evento;
  next();
});

router.get('/eventos', assincrona(async (req, res) => {
  res.json((await eventosRepo.listarAbertos()).map(eventoParaJson));
}));

router.get('/eventos/:id', carregarEvento, (req, res) => {
  res.json(eventoParaJson(req.evento));
});

// Dados pessoais de alunos: só com login (RN07, LGPD).
router.get('/eventos/:id/inscritos', requireAuth, carregarEvento, assincrona(async (req, res) => {
  const inscritos = (await inscricoesRepo.listarPorEvento(req.evento.id)).map((i) => ({
    id: i.id,
    nome: i.nome,
    email: i.email,
    turma: i.turma,
    data_inscricao: i.data_inscricao,
    presente: i.presenca_confirmada === 1,
  }));
  res.json({ evento: { id: req.evento.id, titulo: req.evento.titulo }, total: inscritos.length, inscritos });
}));

// Rota da API que não existe: responde em JSON, não com a página 404 em HTML.
router.use((req, res) => {
  res.status(404).json({ erro: 'Rota não encontrada.' });
});

module.exports = router;
