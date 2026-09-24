// Barra o acesso às rotas do organizador quando não há sessão ativa (RN07).
function requireAuth(req, res, next) {
  if (req.session.usuario) {
    return next();
  }
  // A API responde em JSON; as páginas mandam para o login.
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(401).json({ erro: 'Faça login como organizador para acessar.' });
  }
  res.redirect('/admin/login');
}

module.exports = requireAuth;
