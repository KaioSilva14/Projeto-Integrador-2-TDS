// O Express 4 não percebe erros dentro de funções async: a requisição ficaria sem resposta.
// Envolver a rota com assincrona(...) manda qualquer erro para o tratador de erro 500 do server.js.
function assincrona(rota) {
  return (req, res, next) => Promise.resolve(rota(req, res, next)).catch(next);
}

module.exports = assincrona;
