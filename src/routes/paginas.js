// Páginas institucionais: contato, perguntas frequentes e política de privacidade.
const express = require('express');
const mensagensRepo = require('../repositories/mensagensRepo');
const assincrona = require('../middlewares/assincrona');
const { validarContato, ASSUNTOS, temErros } = require('../validacoes');

const router = express.Router();

router.get('/contato', (req, res) => {
  res.render('public/contato', { valores: {}, erros: {}, assuntos: ASSUNTOS });
});

router.post('/contato', assincrona(async (req, res) => {
  // Campo escondido que só robôs de spam preenchem: finge que deu certo e não grava nada.
  if (req.body.site) return res.redirect(303, '/contato/obrigado');

  const { valores, erros } = validarContato(req.body);
  if (temErros(erros)) {
    return res.status(422).render('public/contato', { valores, erros, assuntos: ASSUNTOS });
  }

  await mensagensRepo.criar(valores);
  req.session.contatoEnviado = valores.nome.split(' ')[0];
  res.redirect(303, '/contato/obrigado');
}));

// Página de agradecimento do contato. Sem envio recente, volta para o formulário.
router.get('/contato/obrigado', (req, res) => {
  const primeiroNome = req.session.contatoEnviado;
  if (!primeiroNome) return res.redirect('/contato');
  delete req.session.contatoEnviado;
  res.render('public/contato-obrigado', { primeiroNome });
});

router.get('/perguntas-frequentes', (req, res) => {
  res.render('public/perguntas');
});

router.get('/privacidade', (req, res) => {
  res.render('public/privacidade');
});

module.exports = router;
