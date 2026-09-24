// Dados do site usados nas páginas, no SEO e no contato.
// Telefone, e-mail e endereço vêm do .env e só aparecem no site se estiverem preenchidos.
module.exports = {
  nomeSite: 'Eventos Escolares — Colégio Gori',
  nomeCurto: 'Eventos Gori',
  escola: 'Colégio Estadual José Luiz Gori',
  cidade: 'Mandaguari/PR',
  descricaoPadrao: 'Veja os próximos eventos do Colégio Estadual José Luiz Gori, em Mandaguari/PR, e garanta sua vaga em segundos, sem criar conta.',
  // Endereço público do site (ex.: https://eventos-gori.vercel.app). Sem ele, usa o endereço da requisição.
  urlSite: (process.env.SITE_URL || '').replace(/\/+$/, ''),
  contato: {
    email: process.env.CONTATO_EMAIL || '',
    telefone: process.env.CONTATO_TELEFONE || '',
    endereco: process.env.ESCOLA_ENDERECO || '',
  },
};
