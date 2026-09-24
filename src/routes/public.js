// Rotas públicas: home, detalhes do evento e inscrição (CLAUDE.md, seção 6.1).
const express = require('express');
const eventosRepo = require('../repositories/eventosRepo');
const categoriasRepo = require('../repositories/categoriasRepo');
const inscricoesRepo = require('../repositories/inscricoesRepo');
const carregarEvento = require('../middlewares/carregarEvento');
const assincrona = require('../middlewares/assincrona');
const { lerId, validarInscricao, temErros } = require('../validacoes');

const router = express.Router();

// Home: eventos abertos, com filtro opcional por categoria (?categoria=ID).
router.get('/', assincrona(async (req, res) => {
  const categoriaSelecionada = lerId(req.query.categoria);
  const [eventos, categorias] = await Promise.all([
    eventosRepo.listarAbertos(categoriaSelecionada),
    categoriasRepo.listar(),
  ]);
  res.render('public/home', { eventos, categorias, categoriaSelecionada });
}));

router.get('/eventos/:id', carregarEvento, (req, res) => {
  res.render('public/evento', { evento: req.evento });
});

router.get('/eventos/:id/inscrever', carregarEvento, (req, res) => {
  res.render('public/inscrever', { evento: req.evento, valores: {}, erros: {}, erro: null });
});

router.post('/eventos/:id/inscrever', carregarEvento, assincrona(async (req, res) => {
  const evento = req.evento;
  const { valores, erros } = validarInscricao(req.body);

  if (temErros(erros)) {
    return res.status(422).render('public/inscrever', { evento, valores, erros, erro: null });
  }

  // RN01, RN02 e RN03 são conferidas dentro do repository, numa transação.
  const resultado = await inscricoesRepo.inscrever(evento.id, valores);
  if (resultado.erro) {
    const eventoAtualizado = await eventosRepo.buscarPorId(evento.id);
    return res.status(409).render('public/inscrever', { evento: eventoAtualizado, valores, erros: {}, erro: resultado.erro });
  }

  // RN09: a confirmação lê daqui, não da URL.
  req.session.ultimaInscricao = {
    eventoId: evento.id,
    nome: valores.nome,
    email: valores.email,
  };
  res.redirect(303, `/eventos/${evento.id}/confirmacao`);
}));

// Página de agradecimento da inscrição.
router.get('/eventos/:id/confirmacao', carregarEvento, (req, res) => {
  const inscricao = req.session.ultimaInscricao;
  if (!inscricao || inscricao.eventoId !== req.evento.id) {
    return res.redirect(`/eventos/${req.evento.id}`);
  }
  delete req.session.ultimaInscricao;
  res.render('public/confirmacao', { evento: req.evento, inscricao });
});

module.exports = router;
