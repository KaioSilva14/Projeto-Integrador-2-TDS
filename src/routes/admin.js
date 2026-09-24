// Painel do organizador (CLAUDE.md, seção 6.3). Montado em /admin com requireAuth no server.js.
const express = require('express');
const eventosRepo = require('../repositories/eventosRepo');
const categoriasRepo = require('../repositories/categoriasRepo');
const inscricoesRepo = require('../repositories/inscricoesRepo');
const mensagensRepo = require('../repositories/mensagensRepo');
const carregarEvento = require('../middlewares/carregarEvento');
const assincrona = require('../middlewares/assincrona');
const { lerId, validarEvento, validarCategoria, temErros } = require('../validacoes');

const router = express.Router();

// Mensagem que aparece uma vez na próxima página (ARCHITECTURE.md, seção 6).
function avisar(req, tipo, texto) {
  req.session.aviso = { tipo, texto };
}

// Quantas mensagens de contato não lidas: aparece no menu de todas as páginas do painel.
router.use(assincrona(async (req, res, next) => {
  res.locals.mensagensNovas = await mensagensRepo.contarNaoLidas();
  next();
}));

// ---------- Dashboard ----------

router.get('/', assincrona(async (req, res) => {
  const [resumo, proximos, recentes] = await Promise.all([
    eventosRepo.resumo(),
    eventosRepo.listarAbertos(),
    inscricoesRepo.recentes(8),
  ]);
  res.render('admin/dashboard', { resumo, proximos: proximos.slice(0, 5), recentes });
}));

// ---------- Eventos ----------

router.get('/eventos', assincrona(async (req, res) => {
  res.render('admin/eventos-lista', { eventos: await eventosRepo.listarTodos() });
}));

async function renderizarFormulario(res, status, dados) {
  res.status(status).render('admin/evento-form', {
    categorias: await categoriasRepo.listar(),
    erros: {},
    ...dados,
  });
}

router.get('/eventos/novo', assincrona(async (req, res) => {
  await renderizarFormulario(res, 200, { evento: null, valores: { status: 'aberto' } });
}));

router.post('/eventos', assincrona(async (req, res) => {
  const { valores, erros } = validarEvento(req.body, { criando: true });
  if (valores.categoria_id && !(await categoriasRepo.buscarPorId(valores.categoria_id))) {
    erros.categoria_id = 'Escolha uma categoria.';
  }
  if (temErros(erros)) {
    return renderizarFormulario(res, 422, { evento: null, valores, erros });
  }

  await eventosRepo.criar(valores);
  avisar(req, 'sucesso', 'Evento criado.');
  res.redirect(303, '/admin/eventos');
}));

router.get('/eventos/:id/editar', carregarEvento, assincrona(async (req, res) => {
  await renderizarFormulario(res, 200, { evento: req.evento, valores: req.evento });
}));

router.post('/eventos/:id', carregarEvento, assincrona(async (req, res) => {
  const evento = req.evento;
  const { valores, erros } = validarEvento(req.body, { criando: false });
  if (valores.categoria_id && !(await categoriasRepo.buscarPorId(valores.categoria_id))) {
    erros.categoria_id = 'Escolha uma categoria.';
  }
  // RN08
  if (!erros.capacidade && valores.capacidade < evento.vagas_ocupadas) {
    erros.capacidade = `A capacidade não pode ser menor que o número de inscritos (${evento.vagas_ocupadas}).`;
  }
  if (temErros(erros)) {
    return renderizarFormulario(res, 422, { evento, valores, erros });
  }

  await eventosRepo.atualizar(evento.id, valores);
  avisar(req, 'sucesso', 'Evento atualizado.');
  res.redirect(303, '/admin/eventos');
}));

router.post('/eventos/:id/excluir', carregarEvento, assincrona(async (req, res) => {
  await eventosRepo.excluir(req.evento.id); // RN04: inscrições vão junto
  avisar(req, 'sucesso', `Evento "${req.evento.titulo}" excluído.`);
  res.redirect(303, '/admin/eventos');
}));

// ---------- Inscritos e check-in ----------

router.get('/eventos/:id/inscritos', carregarEvento, assincrona(async (req, res) => {
  const inscritos = await inscricoesRepo.listarPorEvento(req.evento.id);
  const presentes = inscritos.filter((i) => i.presenca_confirmada).length;
  res.render('admin/inscritos', { evento: req.evento, inscritos, presentes });
}));

router.post('/inscricoes/:id/presenca', assincrona(async (req, res) => {
  const id = lerId(req.params.id);
  const eventoId = id && await inscricoesRepo.alternarPresenca(id);
  if (!eventoId) return res.status(404).render('public/404');
  // Volta para a mesma linha da lista, para a chamada continuar de onde parou (HU13).
  res.redirect(303, `/admin/eventos/${eventoId}/inscritos#inscricao-${id}`);
}));

// Remover uma inscrição (aluno pediu para cancelar): libera a vaga.
router.post('/inscricoes/:id/excluir', assincrona(async (req, res) => {
  const id = lerId(req.params.id);
  const eventoId = id && await inscricoesRepo.excluir(id);
  if (!eventoId) return res.status(404).render('public/404');
  avisar(req, 'sucesso', 'Inscrição removida. A vaga foi liberada.');
  res.redirect(303, `/admin/eventos/${eventoId}/inscritos`);
}));

// ---------- Categorias ----------

router.get('/categorias', assincrona(async (req, res) => {
  res.render('admin/categorias', { categorias: await categoriasRepo.listarComTotal(), valores: {}, erros: {} });
}));

router.post('/categorias', assincrona(async (req, res) => {
  const { valores, erros } = validarCategoria(req.body);
  if (!erros.nome && await categoriasRepo.buscarPorNome(valores.nome)) {
    erros.nome = 'Já existe uma categoria com esse nome.';
  }
  if (temErros(erros)) {
    return res.status(422).render('admin/categorias', { categorias: await categoriasRepo.listarComTotal(), valores, erros });
  }

  await categoriasRepo.criar(valores.nome);
  avisar(req, 'sucesso', `Categoria "${valores.nome}" criada.`);
  res.redirect(303, '/admin/categorias');
}));

router.post('/categorias/:id/excluir', assincrona(async (req, res) => {
  const id = lerId(req.params.id);
  const categoria = id && await categoriasRepo.buscarPorId(id);
  if (!categoria) return res.status(404).render('public/404');

  // RN05: conferido aqui primeiro; o ON DELETE RESTRICT do banco é a segunda defesa.
  const totalEventos = await categoriasRepo.contarEventos(id);
  if (totalEventos > 0) {
    avisar(req, 'erro', `Não é possível excluir: ${totalEventos} evento(s) usam esta categoria.`);
  } else {
    await categoriasRepo.excluir(id);
    avisar(req, 'sucesso', `Categoria "${categoria.nome}" excluída.`);
  }
  res.redirect(303, '/admin/categorias');
}));

// ---------- Mensagens do contato ----------

router.get('/mensagens', assincrona(async (req, res) => {
  res.render('admin/mensagens', { mensagens: await mensagensRepo.listar() });
}));

router.post('/mensagens/:id/lida', assincrona(async (req, res) => {
  const id = lerId(req.params.id);
  if (!id || !(await mensagensRepo.alternarLida(id))) return res.status(404).render('public/404');
  res.redirect(303, `/admin/mensagens#mensagem-${id}`);
}));

router.post('/mensagens/:id/excluir', assincrona(async (req, res) => {
  const id = lerId(req.params.id);
  if (!id || !(await mensagensRepo.excluir(id))) return res.status(404).render('public/404');
  avisar(req, 'sucesso', 'Mensagem excluída.');
  res.redirect(303, '/admin/mensagens');
}));

module.exports = router;
