// Busca o evento do :id da URL e deixa em req.evento; id inválido ou inexistente → página 404.
const eventosRepo = require('../repositories/eventosRepo');
const assincrona = require('./assincrona');
const { lerId } = require('../validacoes');

const carregarEvento = assincrona(async (req, res, next) => {
  const id = lerId(req.params.id);
  const evento = id && await eventosRepo.buscarPorId(id);
  if (!evento) return res.status(404).render('public/404');
  req.evento = evento;
  next();
});

module.exports = carregarEvento;
