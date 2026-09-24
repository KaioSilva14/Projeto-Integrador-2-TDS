// Ponto de entrada: configura o Express e registra as rotas.
require('dotenv').config({ quiet: true });
const path = require('path');
const express = require('express');
const session = require('express-session');

if (!process.env.SESSION_SECRET) {
  console.error('Defina SESSION_SECRET no arquivo .env (veja .env.example).');
  process.exit(1);
}

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: false })); // lê os dados dos formulários HTML
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' },
}));

// Deixa o organizador logado (se houver) disponível em todas as views.
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  next();
});

app.use('/', require('./routes/public'));

app.use((req, res) => {
  res.status(404).render('public/404');
});

const porta = process.env.PORT || 3333;
const servidor = app.listen(porta, () => {
  console.log(`Servidor rodando em http://localhost:${porta}`);
});
servidor.on('error', (erro) => {
  if (erro.code === 'EADDRINUSE') {
    console.error(`A porta ${porta} já está em uso por outro programa. Troque PORT no .env.`);
    process.exit(1);
  }
  throw erro;
});
