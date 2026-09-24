// Painel do organizador (CLAUDE.md, seção 6.3). Montado em /admin com requireAuth no server.js.
const express = require('express');
const eventosRepo = require('../repositories/eventosRepo');
const categoriasRepo = require('../repositories/categoriasRepo');
const inscricoesRepo = require('../repositories/inscricoesRepo');
const carregarEvento = require('../middlewares/carregarEvento');
const { lerId, validarEvento, validarCategoria, temErros } = require('../validacoes');

const router = express.Router();

// Mensagem que aparece uma vez na próxima página (ARCHITECTURE.md, seção 6).
function avisar(req, tipo, texto) {
  req.session.aviso = { tipo, texto };
}

// ---------- Dashboard ----------

router.get('/', (req, res) => {
  res.render('admin/dashboard', {
    resumo: eventosRepo.resumo(),
    proximos: eventosRepo.listarAbertos().slice(0, 5),
    recentes: inscricoesRepo.recentes(8),
  });
});

// ---------- Eventos ----------

router.get('/eventos', (req, res) => {
  res.render('admin/eventos-lista', { eventos: eventosRepo.listarTodos() });
});

function renderizarFormulario(res, status, dados) {
  res.status(status).render('admin/evento-form', {
    categorias: categoriasRepo.listar(),
    erros: {},
    ...dados,
  });
}

router.get('/eventos/novo', (req, res) => {
  renderizarFormulario(res, 200, { evento: null, valores: { status: 'aberto' } });
});

router.post('/eventos', (req, res) => {
  const { valores, erros } = validarEvento(req.body, { criando: true });
  if (valores.categoria_id && !categoriasRepo.buscarPorId(valores.categoria_id)) {
    erros.categoria_id = 'Escolha uma categoria.';
  }
  if (temErros(erros)) {
    return renderizarFormulario(res, 422, { evento: null, valores, erros });
  }

  eventosRepo.criar(valores);
  avisar(req, 'sucesso', 'Evento criado.');
  res.redirect(303, '/admin/eventos');
});

router.get('/eventos/:id/editar', carregarEvento, (req, res) => {
  renderizarFormulario(res, 200, { evento: req.evento, valores: req.evento });
});

router.post('/eventos/:id', carregarEvento, (req, res) => {
  const evento = req.evento;
  const { valores, erros } = validarEvento(req.body, { criando: false });
  if (valores.categoria_id && !categoriasRepo.buscarPorId(valores.categoria_id)) {
    erros.categoria_id = 'Escolha uma categoria.';
  }
  // RN08
  if (!erros.capacidade && valores.capacidade < evento.vagas_ocupadas) {
    erros.capacidade = `A capacidade não pode ser menor que o número de inscritos (${evento.vagas_ocupadas}).`;
  }
  if (temErros(erros)) {
    return renderizarFormulario(res, 422, { evento, valores, erros });
  }

  eventosRepo.atualizar(evento.id, valores);
  avisar(req, 'sucesso', 'Evento atualizado.');
  res.redirect(303, '/admin/eventos');
});

router.post('/eventos/:id/excluir', carregarEvento, (req, res) => {
  eventosRepo.excluir(req.evento.id); // RN04: inscrições vão junto (CASCADE)
  avisar(req, 'sucesso', `Evento "${req.evento.titulo}" excluído.`);
  res.redirect(303, '/admin/eventos');
});

// ---------- Inscritos e check-in ----------

router.get('/eventos/:id/inscritos', carregarEvento, (req, res) => {
  const inscritos = inscricoesRepo.listarPorEvento(req.evento.id);
  const presentes = inscritos.filter((i) => i.presenca_confirmada).length;
  res.render('admin/inscritos', { evento: req.evento, inscritos, presentes });
});

router.post('/inscricoes/:id/presenca', (req, res) => {
  const id = lerId(req.params.id);
  const eventoId = id && inscricoesRepo.alternarPresenca(id);
  if (!eventoId) return res.status(404).render('public/404');
  // Volta para a mesma linha da lista, para a chamada continuar de onde parou (HU13).
  res.redirect(303, `/admin/eventos/${eventoId}/inscritos#inscricao-${id}`);
});

// ---------- Categorias ----------

router.get('/categorias', (req, res) => {
  res.render('admin/categorias', { categorias: categoriasRepo.listarComTotal(), valores: {}, erros: {} });
});

router.post('/categorias', (req, res) => {
  const { valores, erros } = validarCategoria(req.body);
  if (!erros.nome && categoriasRepo.buscarPorNome(valores.nome)) {
    erros.nome = 'Já existe uma categoria com esse nome.';
  }
  if (temErros(erros)) {
    return res.status(422).render('admin/categorias', { categorias: categoriasRepo.listarComTotal(), valores, erros });
  }

  categoriasRepo.criar(valores.nome);
  avisar(req, 'sucesso', `Categoria "${valores.nome}" criada.`);
  res.redirect(303, '/admin/categorias');
});

router.post('/categorias/:id/excluir', (req, res) => {
  const id = lerId(req.params.id);
  const categoria = id && categoriasRepo.buscarPorId(id);
  if (!categoria) return res.status(404).render('public/404');

  // RN05: conferido aqui primeiro; o ON DELETE RESTRICT do banco é a segunda defesa.
  const totalEventos = categoriasRepo.contarEventos(id);
  if (totalEventos > 0) {
    avisar(req, 'erro', `Não é possível excluir: ${totalEventos} evento(s) usam esta categoria.`);
  } else {
    categoriasRepo.excluir(id);
    avisar(req, 'sucesso', `Categoria "${categoria.nome}" excluída.`);
  }
  res.redirect(303, '/admin/categorias');
});

module.exports = router;
