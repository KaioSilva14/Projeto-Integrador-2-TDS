// Validação dos formulários (docs/RULES.md, seção 2).
// Cada função devolve { valores, erros }: valores já limpos e erros por campo ({} = tudo certo).
// Aqui não se consulta o banco — o que depende do banco (categoria existe, RN08) fica na rota.

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

// Id vindo da URL ou de um <select>: inteiro positivo ou null.
function lerId(valor) {
  const numero = Number(valor);
  return Number.isInteger(numero) && numero > 0 ? numero : null;
}

function doisDigitos(n) {
  return String(n).padStart(2, '0');
}

// Data de hoje no fuso do computador, no mesmo formato do banco (YYYY-MM-DD).
function hojeLocal() {
  const agora = new Date();
  return `${agora.getFullYear()}-${doisDigitos(agora.getMonth() + 1)}-${doisDigitos(agora.getDate())}`;
}

function dataValida(valor) {
  const partes = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  if (!partes) return false;
  const [, ano, mes, dia] = partes.map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  // 2026-02-31 vira 03/03 no Date; comparar as partes pega essas datas impossíveis.
  return data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia;
}

function horaValida(valor) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(valor);
}

function emailValido(valor) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
}

function validarInscricao(corpo) {
  const valores = {
    nome: texto(corpo.nome),
    email: texto(corpo.email).toLowerCase(),
    turma: texto(corpo.turma),
  };
  const erros = {};

  if (valores.nome.length < 3 || valores.nome.length > 100) {
    erros.nome = 'Informe seu nome completo.';
  }
  if (!emailValido(valores.email) || valores.email.length > 120) {
    erros.email = 'Informe um e-mail válido.';
  }
  if (!valores.turma || valores.turma.length > 20) {
    erros.turma = 'Informe sua turma.';
  }

  return { valores, erros };
}

// criando = true aplica a RN10 (evento novo não pode ser no passado).
function validarEvento(corpo, { criando }) {
  const valores = {
    titulo: texto(corpo.titulo),
    descricao: texto(corpo.descricao),
    categoria_id: lerId(corpo.categoria_id),
    data_evento: texto(corpo.data_evento),
    hora_inicio: texto(corpo.hora_inicio),
    hora_fim: texto(corpo.hora_fim),
    local: texto(corpo.local),
    capacidade: Number(texto(corpo.capacidade)),
    status: corpo.status === 'encerrado' ? 'encerrado' : 'aberto',
  };
  const erros = {};

  if (!valores.titulo || valores.titulo.length > 120) {
    erros.titulo = 'Informe o título do evento.';
  }
  if (valores.descricao.length > 2000) {
    erros.descricao = 'A descrição pode ter até 2000 caracteres.';
  }
  if (!valores.categoria_id) {
    erros.categoria_id = 'Escolha uma categoria.';
  }
  if (!dataValida(valores.data_evento)) {
    erros.data_evento = 'Informe uma data válida.';
  } else if (criando && valores.data_evento < hojeLocal()) {
    erros.data_evento = 'A data do evento não pode estar no passado.'; // RN10
  }
  if (!horaValida(valores.hora_inicio)) {
    erros.hora_inicio = 'Informe o horário de início.';
  }
  if (valores.hora_fim && (!horaValida(valores.hora_fim) || valores.hora_fim <= valores.hora_inicio)) {
    erros.hora_fim = 'O horário de término deve ser depois do início.';
  }
  if (!valores.local || valores.local.length > 120) {
    erros.local = 'Informe o local.';
  }
  if (!Number.isInteger(valores.capacidade) || valores.capacidade < 1 || valores.capacidade > 10000) {
    erros.capacidade = 'A capacidade deve ser um número maior que zero.';
  }

  return { valores, erros };
}

function validarCategoria(corpo) {
  const valores = { nome: texto(corpo.nome) };
  const erros = {};

  if (!valores.nome || valores.nome.length > 40) {
    erros.nome = 'Informe o nome da categoria (até 40 caracteres).';
  }

  return { valores, erros };
}

const ASSUNTOS = ['Dúvida sobre um evento', 'Problema na inscrição', 'Sugestão de evento', 'Outro'];

function validarContato(corpo) {
  const valores = {
    nome: texto(corpo.nome),
    email: texto(corpo.email).toLowerCase(),
    assunto: ASSUNTOS.includes(corpo.assunto) ? corpo.assunto : '',
    mensagem: texto(corpo.mensagem),
  };
  const erros = {};

  if (valores.nome.length < 3 || valores.nome.length > 100) {
    erros.nome = 'Informe seu nome completo.';
  }
  if (!emailValido(valores.email) || valores.email.length > 120) {
    erros.email = 'Informe um e-mail válido para podermos responder.';
  }
  if (!valores.assunto) {
    erros.assunto = 'Escolha o assunto.';
  }
  if (valores.mensagem.length < 10) {
    erros.mensagem = 'Escreva sua mensagem (pelo menos 10 caracteres).';
  } else if (valores.mensagem.length > 1000) {
    erros.mensagem = 'A mensagem pode ter até 1000 caracteres.';
  }

  return { valores, erros };
}

function temErros(erros) {
  return Object.keys(erros).length > 0;
}

module.exports = {
  lerId,
  hojeLocal,
  validarInscricao,
  validarEvento,
  validarCategoria,
  validarContato,
  ASSUNTOS,
  temErros,
};
