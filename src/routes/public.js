// Rotas públicas: home, detalhes do evento e inscrição (CLAUDE.md, seção 6.1).
const express = require('express');
const eventosRepo = require('../repositories/eventosRepo');
const categoriasRepo = require('../repositories/categoriasRepo');

const router = express.Router();

// Home: eventos abertos, com filtro opcional por categoria (?categoria=ID).
router.get('/', (req, res) => {
  const categoriaSelecionada = Number(req.query.categoria) || null;
  const eventos = eventosRepo.listarAbertos(categoriaSelecionada);
  const categorias = categoriasRepo.listar();
  res.render('public/home', { eventos, categorias, categoriaSelecionada });
});

module.exports = router;
