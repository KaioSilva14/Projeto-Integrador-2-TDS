// Barra o acesso às rotas do organizador quando não há sessão ativa (CLAUDE.md, regra 7).
function requireAuth(req, res, next) {
  if (req.session.usuario) {
    return next();
  }
  res.redirect('/admin/login');
}

module.exports = requireAuth;
