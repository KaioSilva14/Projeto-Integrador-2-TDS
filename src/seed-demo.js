// Dados de demonstração: eventos e inscrições realistas para testar e apresentar.
// Rodar com `npm run seed:demo` (depois do `npm run seed`). Só roda com o banco sem eventos,
// para não misturar com dados reais — para recomeçar, ver CLAUDE.md, seção 16.6.
require('dotenv').config({ quiet: true });
const db = require('./db');
const inscricoesRepo = require('./repositories/inscricoesRepo');

const eventos = [
  {
    titulo: 'Feira de Ciências 2026',
    descricao: 'Apresentação dos projetos de ciências de todas as turmas.\nAberta à comunidade.',
    categoria: 'Feira', dias: 10, hora_inicio: '08:00', hora_fim: '12:00', local: 'Quadra coberta', capacidade: 120,
  },
  {
    titulo: 'Palestra: Carreiras em Tecnologia',
    descricao: 'Profissionais da região contam como é trabalhar com desenvolvimento de software.',
    categoria: 'Palestra', dias: 4, hora_inicio: '19:00', hora_fim: '20:30', local: 'Auditório', capacidade: 60,
  },
  {
    titulo: 'Oficina de Currículo (vaga única — demonstração)',
    descricao: 'Evento com capacidade 1 para mostrar o bloqueio de vagas no pitch.',
    categoria: 'Palestra', dias: 6, hora_inicio: '14:00', hora_fim: null, local: 'Sala 12', capacidade: 1,
  },
  {
    titulo: 'Reunião de Pais — 2º ano',
    descricao: 'Entrega de boletins do 3º bimestre.',
    categoria: 'Reunião', dias: 7, hora_inicio: '19:30', hora_fim: '21:00', local: 'Salas do 2º ano', capacidade: 80,
  },
  {
    titulo: 'Torneio de Futsal Interclasses',
    descricao: null,
    categoria: 'Esportivo', dias: 14, hora_inicio: '13:30', hora_fim: '17:30', local: 'Quadra coberta', capacidade: 8,
  },
  {
    titulo: 'Sarau Cultural',
    descricao: 'Música, poesia e teatro apresentados pelos alunos.',
    categoria: 'Cultural', dias: 21, hora_inicio: '19:00', hora_fim: '22:00', local: 'Pátio', capacidade: 150,
  },
  {
    titulo: 'Olimpíada de Matemática — 1ª fase',
    descricao: 'Prova individual. Trazer caneta azul ou preta.',
    categoria: 'Competição', dias: -5, hora_inicio: '09:00', hora_fim: '11:30', local: 'Biblioteca', capacidade: 40,
  },
];

const alunos = [
  ['Ana Beatriz Souza', '2º TDS'], ['Bruno Henrique Lima', '2º TDS'], ['Carla Mendes', '1º TDS'],
  ['Diego Ferreira', '3º A'], ['Eduarda Costa', '2º TDS'], ['Felipe Rocha', '1º B'],
  ['Gabriela Martins', '3º A'], ['Heloísa Pereira', '2º A'], ['Igor Santos', '1º TDS'],
  ['Júlia Almeida', '2º TDS'], ['Lucas Oliveira', '3º B'], ['Mariana Ribeiro', '2º A'],
];
const emailDe = (nome) => nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ /g, '.') + '@aluno.escola.com';

async function main() {
  const { total } = await db.obter('SELECT COUNT(*) AS total FROM eventos');
  if (total > 0) {
    throw new Error(`O banco já tem ${total} evento(s). Resete o banco antes (CLAUDE.md, seção 16.6).`);
  }

  const idCategoria = {};
  for (const c of await db.consultar('SELECT id, nome FROM categorias')) idCategoria[c.nome] = c.id;

  const ids = [];
  for (const e of eventos) {
    if (!idCategoria[e.categoria]) throw new Error(`Categoria "${e.categoria}" não existe. Rode "npm run seed" primeiro.`);
    // Datas relativas a hoje, para a demonstração nunca ficar com eventos "vencidos".
    const { data } = await db.obter("SELECT date('now', 'localtime', ?) AS data", [`${e.dias} days`]);
    const r = await db.executar(`
      INSERT INTO eventos (titulo, descricao, categoria_id, data_evento, hora_inicio, hora_fim, local, capacidade, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [e.titulo, e.descricao, idCategoria[e.categoria], data, e.hora_inicio, e.hora_fim, e.local, e.capacidade,
      e.dias < 0 ? 'encerrado' : 'aberto']);
    ids.push(r.id);
  }

  // Inscrições pela mesma função que o site usa, para respeitar todas as regras.
  // O evento que já passou (índice 6) recebe as inscrições direto no banco, como se tivessem sido feitas antes.
  const inscrever = async (indiceEvento, indicesAlunos) => {
    for (const i of indicesAlunos) {
      const [nome, turma] = alunos[i];
      const dados = { nome, email: emailDe(nome), turma };
      if (indiceEvento === 6) {
        let participante = await db.obter('SELECT id FROM participantes WHERE email = ?', [dados.email]);
        if (!participante) {
          participante = { id: (await db.executar('INSERT INTO participantes (nome, email, turma) VALUES (?, ?, ?)', [nome, dados.email, turma])).id };
        }
        await db.executar('INSERT INTO inscricoes (evento_id, participante_id, presenca_confirmada) VALUES (?, ?, ?)',
          [ids[indiceEvento], participante.id, i % 3 === 0 ? 0 : 1]);
      } else {
        const resultado = await inscricoesRepo.inscrever(ids[indiceEvento], dados);
        if (resultado.erro) throw new Error(`${eventos[indiceEvento].titulo}: ${resultado.erro}`);
      }
    }
  };

  await inscrever(0, [0, 1, 2, 3, 4, 5, 6, 7, 8]);
  await inscrever(1, [0, 1, 4, 9, 10, 11]);
  await inscrever(4, [1, 3, 5, 6, 8, 10, 11, 2]); // futsal: 8 de 8 — aparece como "Esgotado"
  await inscrever(5, [2, 7, 9]);
  await inscrever(6, [0, 3, 4, 6, 9, 10]);
  // A "vaga única" (índice 2) fica sem ninguém: a primeira inscrição é feita ao vivo no pitch.

  const { quantidade } = await db.obter('SELECT COUNT(*) AS quantidade FROM inscricoes');
  console.log(`Demonstração criada: ${ids.length} eventos, ${alunos.length} alunos, ${quantidade} inscrições.`);
}

main()
  .catch((erro) => { console.error(erro.message); process.exitCode = 1; })
  .finally(() => db.fechar());
