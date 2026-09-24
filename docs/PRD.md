# PRD — Sistema de Eventos Escolares

> Documento de requisitos do produto. Diz **o que** o sistema precisa fazer e **como saber que está pronto**.
> O **como fazer** está em [ARCHITECTURE.md](ARCHITECTURE.md) e [RULES.md](RULES.md).

| | |
|---|---|
| Versão | 1.0 — 24/09/2026 |
| Escola | Colégio Estadual José Luiz Gori — Mandaguari/PR |
| Turma / Grupo | 2º TDS — Grupo 7 |
| Entrega | 04/12/2026 (TDS Innovation Day) |

---

## 1. Problema

Os eventos da escola (feiras, palestras, reuniões de pais, competições, semanas culturais) são divulgados em lugares diferentes: mural, grupos de WhatsApp, boca a boca. Resultado:

- muitos alunos nem ficam sabendo que o evento existe ou que podem se inscrever;
- a coordenação não sabe quantas pessoas vão aparecer, e eventos com lugar limitado lotam além da conta ou ficam vazios;
- ninguém registra quem compareceu, então não sobra histórico de participação.

## 2. Objetivo

Um só lugar onde a escola publica eventos com vagas limitadas, o aluno se inscreve em segundos sem criar conta, e a coordenação sabe exatamente quem vai e quem compareceu.

### Como saber se deu certo (metas do MVP)

| Meta | Como medir na demonstração |
|---|---|
| Inscrição rápida | Um aluno se inscreve em **menos de 1 minuto**, pelo celular, sem ajuda |
| Vagas nunca estouram | Evento com capacidade 1: a 2ª inscrição é recusada |
| Sem inscrição repetida | Mesmo e-mail no mesmo evento é recusado |
| Presença registrada | O organizador marca presença na lista e o número de presentes atualiza |

---

## 3. Quem usa

### Organizador (coordenação ou professor)
- Usa no **computador** da escola, geralmente com pressa entre uma aula e outra.
- Precisa: publicar um evento, ver quantos se inscreveram e fazer a chamada no dia.
- Existe **um único** login de organizador no MVP.

### Participante (aluno)
- Usa quase sempre no **celular**, pelo link que recebeu no grupo da turma.
- Precisa: ver o que está acontecendo, garantir a vaga e ter certeza de que deu certo.
- **Não** cria conta nem senha — só informa nome, e-mail e turma.

---

## 4. Histórias de usuário e critérios de aceite

Cada história só está pronta quando **todos** os critérios passam. Os códigos (HU01…) são usados no [TASKS.md](TASKS.md).

### Participante

**HU01 — Ver os eventos abertos**
Como aluno, quero ver os próximos eventos da escola para decidir de qual participar.
- [x] A home (`/`) mostra só eventos com status `aberto` e data de hoje em diante.
- [x] Cada card mostra título, categoria, data (dd/mm/aaaa), horário, local e vagas restantes.
- [x] Evento sem vagas aparece com o selo "Esgotado" (não some da lista).
- [x] Eventos ordenados do mais próximo para o mais distante.
- [x] Sem nenhum evento aberto, aparece uma mensagem explicando isso (não uma página em branco).

**HU02 — Filtrar por categoria**
Como aluno, quero filtrar por categoria para achar rápido o tipo de evento que me interessa.
- [x] Um seletor com "Todas" + as categorias cadastradas filtra a lista.
- [x] O filtro fica na URL (`/?categoria=2`) — dá para mandar o link filtrado no grupo.
- [x] Categoria inexistente na URL não quebra a página (mostra lista vazia ou todas).

**HU03 — Ver detalhes de um evento**
Como aluno, quero ver todas as informações de um evento antes de me inscrever.
- [x] `/eventos/:id` mostra título, categoria, descrição, data, horário de início e fim, local, capacidade e vagas restantes.
- [x] O botão "Inscrever-se" só aparece se o evento aceita inscrição (RN01, RN03). Caso contrário, aparece o motivo: "Esgotado" ou "Inscrições encerradas".
- [x] Id inexistente ou não numérico → página 404.

**HU04 — Inscrever-se**
Como aluno, quero me inscrever informando nome, e-mail e turma, sem criar conta.
- [x] Formulário com três campos obrigatórios: nome, e-mail, turma.
- [x] Todas as validações do [RULES.md](RULES.md) (seção 2) são feitas **no servidor**.
- [x] Erro de validação: o formulário volta com a mensagem e com os dados já digitados (o aluno não redigita tudo).
- [x] Evento esgotado, encerrado ou e-mail já inscrito → recusado com a mensagem de RN01/RN02/RN03.
- [x] Sucesso → redireciona para a confirmação.

**HU05 — Receber confirmação**
Como aluno, quero ver claramente que minha inscrição deu certo.
- [x] A página de confirmação mostra o nome do aluno, o evento, a data, o horário e o local.
- [x] Os dados vêm da sessão, não da URL (RN09). Abrir `/eventos/:id/confirmacao` sem ter se inscrito redireciona para os detalhes do evento.
- [x] Recarregar a página (F5) **não** cria uma segunda inscrição.

### Organizador

**HU06 — Entrar e sair do painel**
- [x] `/admin/login` pede e-mail e senha; senha conferida com `bcrypt.compare` (RN06).
- [x] Login errado → "E-mail ou senha incorretos." (não dizer qual dos dois errou).
- [x] Sem login, qualquer `/admin/*` redireciona para o login (RN07).
- [x] "Sair" encerra a sessão e volta para a home.

**HU07 — Ver o resumo no painel**
- [x] `/admin` mostra: total de eventos abertos, total de inscrições, próximos eventos e as inscrições mais recentes.

**HU08 — Criar evento**
- [x] Formulário com todos os campos do evento; categoria escolhida numa lista.
- [x] Validações da seção 2 do RULES.md; erro volta com os dados preenchidos.
- [x] Sucesso → volta para a lista de eventos com a mensagem "Evento criado."

**HU09 — Editar e encerrar evento**
- [x] Mesmo formulário da criação, já preenchido.
- [x] Dá para mudar o status para `encerrado` (bloqueia novas inscrições — RN03).
- [x] Não dá para reduzir a capacidade para menos que o número de inscritos (RN08).

**HU10 — Excluir evento**
- [x] O navegador pede confirmação antes ("Excluir o evento X e suas N inscrições?").
- [x] Excluir o evento apaga as inscrições dele (RN04).

**HU11 — Gerenciar categorias**
- [x] Listar, criar e excluir categorias.
- [x] Nome repetido é recusado.
- [x] Categoria com evento vinculado não pode ser excluída (RN05) — mensagem explica quantos eventos usam.

**HU12 — Ver inscritos de um evento**
- [x] `/admin/eventos/:id/inscritos` lista nome, e-mail, turma, data da inscrição e presença.
- [x] Mostra no topo: inscritos / capacidade e quantos presentes.

**HU13 — Fazer check-in**
- [x] Um botão por inscrito alterna presença (presente ↔ ausente).
- [x] Após clicar, a lista volta **na mesma posição** (âncora `#inscricao-ID`), para fazer a chamada sem perder o lugar.

### Páginas de apoio

**HU15 — Falar com a coordenação**
- [x] `/contato` com nome, e-mail, assunto e mensagem (até 1000 caracteres, com contador).
- [x] Erros mostram o que corrigir e mantêm o que foi digitado.
- [x] Depois de enviar, página de agradecimento; a mensagem aparece em `/admin/mensagens`.

**HU16 — Tirar dúvidas sozinho**
- [x] `/perguntas-frequentes` com 5 perguntas (conta, confirmação, esgotado, cancelamento, privacidade).

**HU17 — Saber o que é feito com meus dados**
- [x] `/privacidade` explica, em linguagem simples, dados coletados, uso, quem vê, cookies e como pedir exclusão (LGPD).

**HU18 — Cancelar inscrição**
- [x] O aluno pede pelo contato; o organizador remove a inscrição na lista de inscritos e a vaga volta a ficar disponível.

### Sistema

**HU14 — API JSON**
- [x] `GET /api/eventos` e `GET /api/eventos/:id` devolvem JSON válido, com vagas restantes calculadas.
- [x] `GET /api/eventos/:id/inscritos` exige login (RN07).
- [x] Id inexistente → `404` com `{ "erro": "Evento não encontrado." }`.

---

## 5. Requisitos não funcionais

| Código | Requisito |
|---|---|
| RNF01 | Roda em qualquer máquina com Node.js LTS, **sem instalar servidor de banco** (SQLite em arquivo). |
| RNF02 | Páginas públicas funcionam bem em celular (a partir de 360 px de largura). |
| RNF03 | Todo o sistema em português do Brasil: textos, datas (dd/mm/aaaa) e horários (24h). |
| RNF04 | Funciona **sem JavaScript no navegador** — formulários HTML puros. JS só como melhoria (ex.: confirmação antes de excluir). |
| RNF05 | Coleta o mínimo de dados pessoais (nome, e-mail, turma). Dados de alunos só aparecem para o organizador logado (LGPD — são menores de idade). |
| RNF06 | Contraste de texto AA (4.5:1) e navegação por teclado — ver [DESIGN.md](DESIGN.md). |
| RNF07 | Senhas nunca em texto puro; segredos só no `.env`. |
| RNF08 | **Dados persistentes em produção:** banco no Turso (não no disco da Vercel), backup com `npm run backup`. |
| RNF09 | Pronto para busca e redes sociais: meta description, `sitemap.xml`, `robots.txt`, imagem de compartilhamento, dados estruturados. |

---

## 6. Escopo

- **Dentro do MVP:** tudo o que está na seção 4 acima (= CLAUDE.md, seção 3.1).
- **Desejável, se sobrar tempo:** encerramento automático por data, exportar inscritos em CSV, busca por texto e filtro por data, página "meus eventos" pelo e-mail.
- **Fora:** notificação por e-mail/push, vários organizadores com permissões, app nativo, pagamento, upload de imagem.

## 7. Riscos

| Risco | O que fazer |
|---|---|
| Projeto feito por uma pessoa só, prazo fixo | Seguir o [TASKS.md](TASKS.md) na ordem; nada do "desejável" antes do MVP completo. |
| Internet da escola cair no dia do pitch | O sistema roda 100% local (`localhost`). Só as fontes do Google dependem de internet — sem elas, o CSS cai para a fonte do sistema e continua legível. |
| Banco com dados bagunçados na hora da demonstração | Ter um script/roteiro de dados de teste e resetar o banco antes (CLAUDE.md, 16.6). |
