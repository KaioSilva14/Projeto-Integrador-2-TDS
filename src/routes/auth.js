// Login e logout do organizador (CLAUDE.md, seção 6.2).
const express = require('express');
const bcrypt = require('bcryptjs');
const usuariosRepo = require('../repositories/usuariosRepo');
const assincrona = require('../middlewares/assincrona');

const router = express.Router();

router.get('/admin/login', (req, res) => {
  if (req.session.usuario) return res.redirect('/admin');
  res.render('admin/login', { erro: null, email: '' });
});

router.post('/admin/login', assincrona(async (req, res) => {
  const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const senha = typeof req.body.senha === 'string' ? req.body.senha : '';
  const usuario = email && await usuariosRepo.buscarPorEmail(email);

  // RN06: mesma mensagem para e-mail e senha errados — não entrega qual dos dois existe.
  if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
    return res.status(401).render('admin/login', { erro: 'E-mail ou senha incorretos.', email });
  }

  // Sessão nova a cada login: descarta tudo o que havia no cookie antes.
  req.session = { usuario: { id: usuario.id, nome: usuario.nome } };
  res.redirect(303, '/admin');
}));

router.post('/admin/logout', (req, res) => {
  req.session = null; // apaga o cookie da sessão
  res.redirect(303, '/');
});

module.exports = router;
