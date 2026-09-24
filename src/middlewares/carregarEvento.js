// Busca o evento do :id da URL e deixa em req.evento; id inválido ou inexistente → página 404.
const eventosRepo = require('../repositories/eventosRepo');
const { lerId } = require('../validacoes');

function carregarEvento(req, res, next) {
  const id = lerId(req.params.id);
  const evento = id && eventosRepo.buscarPorId(id);
  if (!evento) return res.status(404).render('public/404');
  req.evento = evento;
  next();
}

module.exports = carregarEvento;
