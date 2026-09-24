// robots.txt e sitemap.xml: dizem aos buscadores (Google etc.) o que indexar.
// São gerados aqui, e não em public/, porque precisam do endereço real do site.
const express = require('express');
const eventosRepo = require('../repositories/eventosRepo');
const assincrona = require('../middlewares/assincrona');

const router = express.Router();

router.get('/robots.txt', (req, res) => {
  res.type('text/plain').send([
    'User-agent: *',
    'Allow: /',
    'Disallow: /admin',
    'Disallow: /api/',
    'Disallow: /*/inscrever',
    'Disallow: /*/confirmacao',
    '',
    `Sitemap: ${res.locals.urlBase}/sitemap.xml`,
    '',
  ].join('\n'));
});

function escaparXml(texto) {
  return String(texto).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}

router.get('/sitemap.xml', assincrona(async (req, res) => {
  const base = res.locals.urlBase;
  const eventos = await eventosRepo.listarAbertos();
  const urls = [
    { loc: `${base}/`, prioridade: '1.0', frequencia: 'daily' },
    ...eventos.map((e) => ({ loc: `${base}/eventos/${e.id}`, prioridade: '0.8', frequencia: 'daily' })),
    { loc: `${base}/perguntas-frequentes`, prioridade: '0.5', frequencia: 'monthly' },
    { loc: `${base}/contato`, prioridade: '0.5', frequencia: 'yearly' },
    { loc: `${base}/privacidade`, prioridade: '0.3', frequencia: 'yearly' },
  ];

  res.type('application/xml').send(
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    + '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    + urls.map((u) => `  <url><loc>${escaparXml(u.loc)}</loc><changefreq>${u.frequencia}</changefreq><priority>${u.prioridade}</priority></url>`).join('\n')
    + '\n</urlset>\n');
}));

module.exports = router;
