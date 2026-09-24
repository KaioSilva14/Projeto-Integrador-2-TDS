// Ponto de entrada: configura o Express e registra as rotas.
require('dotenv').config({ quiet: true });
const path = require('path');
const express = require('express');
const session = require('express-session');
const requireAuth = require('./middlewares/requireAuth');

if (!process.env.SESSION_SECRET) {
  console.error('Defina SESSION_SECRET no arquivo .env (veja .env.example).');
  process.exit(1);
}

const app = express();
app.disable('x-powered-by');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '..', 'views'));

// Funções disponíveis em todas as views. O banco guarda 'YYYY-MM-DD'; a tela mostra 'dd/mm/aaaa'.
app.locals.formatarData = (data) => {
  if (!data) return '';
  const [ano, mes, dia] = data.slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
};
app.locals.formatarDataHora = (dataHora) => {
  if (!dataHora) return '';
  return `${app.locals.formatarData(dataHora)} ${dataHora.slice(11, 16)}`;
};

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: false })); // lê os dados dos formulários HTML
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' },
}));

// Deixa disponível em todas as views: organizador logado, página atual e o aviso pendente.
// O aviso é mostrado uma vez e apagado da sessão.
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.caminho = req.path;
  res.locals.aviso = req.session.aviso || null;
  delete req.session.aviso;
  next();
});

app.use('/', require('./routes/public'));
app.use('/', require('./routes/auth'));
app.use('/admin', requireAuth, require('./routes/admin'));
app.use('/api', require('./routes/api'));

app.use((req, res) => {
  res.status(404).render('public/404');
});

// Erro inesperado: detalhe só no console, mensagem genérica para o usuário (RULES.md, seção 3).
app.use((erro, req, res, next) => {
  console.error(erro);
  if (res.headersSent) return next(erro);
  res.status(500).render('public/erro');
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
