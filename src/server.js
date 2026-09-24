// Ponto de entrada: configura o Express e registra as rotas.
// Localmente, `npm run dev` sobe o servidor. Na Vercel, o app exportado no fim vira uma função.
require('dotenv').config({ quiet: true });
const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');
const requireAuth = require('./middlewares/requireAuth');
const config = require('./config');

if (!process.env.SESSION_SECRET) {
  throw new Error('Defina SESSION_SECRET no .env (ou nas variáveis de ambiente da Vercel). Veja o .env.example.');
}

const producao = Boolean(process.env.VERCEL) || process.env.NODE_ENV === 'production';
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // na Vercel a requisição chega por um proxy HTTPS

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
app.locals.config = config;

// Na Vercel, a pasta public/ é servida pela CDN e esta linha é ignorada; localmente ela serve os arquivos.
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.urlencoded({ extended: false, limit: '20kb' })); // lê os formulários HTML

// A sessão fica num cookie assinado (não na memória do servidor): funciona na Vercel,
// onde cada requisição pode cair numa instância diferente.
app.use(cookieSession({
  name: 'sessao',
  keys: [process.env.SESSION_SECRET],
  httpOnly: true,
  sameSite: 'lax',
  secure: producao,
  maxAge: 8 * 60 * 60 * 1000, // 8 horas
}));

// Deixa disponível em todas as views: organizador logado, página atual, endereço do site e o aviso pendente.
// O aviso é mostrado uma vez e apagado da sessão.
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  res.locals.caminho = req.path;
  res.locals.urlBase = config.urlSite || `${req.protocol}://${req.get('host')}`;
  res.locals.aviso = req.session.aviso || null;
  delete req.session.aviso;
  next();
});

app.use('/', require('./routes/seo'));
app.use('/', require('./routes/public'));
app.use('/', require('./routes/paginas'));
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
  if (req.originalUrl.startsWith('/api/')) {
    return res.status(500).json({ erro: 'Erro interno. Tente de novo em instantes.' });
  }
  res.status(500).render('public/erro');
});

// Só abre a porta quando rodado direto (`npm run dev` / `npm start`). Na Vercel, o app é exportado.
if (require.main === module) {
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
}

module.exports = app;
