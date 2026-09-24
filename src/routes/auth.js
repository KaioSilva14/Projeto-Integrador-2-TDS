// Login e logout do organizador (CLAUDE.md, seção 6.2).
const express = require('express');
const bcrypt = require('bcryptjs');
const usuariosRepo = require('../repositories/usuariosRepo');

const router = express.Router();

router.get('/admin/login', (req, res) => {
  if (req.session.usuario) return res.redirect('/admin');
  res.render('admin/login', { erro: null, email: '' });
});

router.post('/admin/login', (req, res, next) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const senha = typeof req.body.senha === 'string' ? req.body.senha : '';
  const usuario = usuariosRepo.buscarPorEmail(email);

  // RN06: mesma mensagem para e-mail e senha errados — não entrega qual dos dois existe.
  if (!usuario || !bcrypt.compareSync(senha, usuario.senha_hash)) {
    return res.status(401).render('admin/login', { erro: 'E-mail ou senha incorretos.', email });
  }

  // Nova sessão a cada login, para ninguém reaproveitar um id de sessão antigo.
  req.session.regenerate((erro) => {
    if (erro) return next(erro);
    req.session.usuario = { id: usuario.id, nome: usuario.nome };
    res.redirect(303, '/admin');
  });
});

router.post('/admin/logout', (req, res, next) => {
  req.session.destroy((erro) => {
    if (erro) return next(erro);
    res.redirect(303, '/');
  });
});

module.exports = router;
