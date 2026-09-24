# CLAUDE.md — Sistema de Eventos Escolares

> Arquivo de contexto para o Claude Code. Leia isto antes de gerar ou alterar qualquer código deste projeto.

**Documentação detalhada em [`docs/`](docs/):**

| Arquivo | Para que serve | Quando abrir |
|---|---|---|
| [PRD.md](docs/PRD.md) | Requisitos: histórias de usuário e critérios de aceite | Antes de começar qualquer funcionalidade |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Camadas, fluxo de uma requisição, DER, rotas e decisões técnicas | Antes de criar arquivo, rota ou tabela |
| [RULES.md](docs/RULES.md) | Regras de negócio numeradas (RN01…), segurança e convenções de código | Antes de escrever validação ou consulta |
| [DESIGN.md](docs/DESIGN.md) | Tokens visuais, componentes e o que fazer/evitar na interface | Antes de mexer em view ou CSS |
| [TASKS.md](docs/TASKS.md) | Lista de tarefas por semana, com o que já está feito | No começo de cada aula |
| [MEMORY.md](docs/MEMORY.md) | Decisões tomadas, problemas já resolvidos e diário do projeto | Quando algo "estranho" acontecer, e ao fim de cada sessão |

Este arquivo é o resumo; os `docs/` detalham. Se um doc e o código discordarem, **o código é a verdade** — corrija o doc na mesma hora. Ao terminar uma tarefa: marcar em `TASKS.md` e anotar em `MEMORY.md` qualquer decisão ou problema novo.

---

## 0. Ficha do projeto

| Campo | Valor |
|---|---|
| Projeto | Sistema de Eventos Escolares |
| Disciplinas | Banco de Dados II, Back-End, Inovação Tecnológica e Empreendedorismo |
| Turma | 2º TDS |
| Escola | Colégio Estadual José Luiz Gori — Mandaguari/PR |
| Professor | Anilton Bittencourt |
| Grupo | Grupo 7 |
| Integrantes cadastrados | Heitor Eckel, Kaio Silva, Samuel Donato (execução técnica sob sua responsabilidade — ver seção 1) |
| Início | 29/09/2026 |
| Entrega final | 04/12/2026 (TDS Innovation Day) |

---

## 1. Como este projeto vai ser executado

O grupo tem 4 integrantes no papel, mas **você vai construir o sistema inteiro sozinho**, sem divisão de papéis. Por isso este documento não segue o modelo "líder / responsável pelo banco / responsável pelo back-end" sugerido pelo professor — ele descreve **um único fluxo de trabalho sequencial** que você consegue tocar solo, dentro das 9 aulas semanais.

Consequência prática nas decisões abaixo: sempre que havia uma escolha entre "mais robusto, mais peças" e "mais simples, menos peças", **escolhi o mais simples que ainda atende os critérios de avaliação**. Isso é proposital — um projeto solo não pode depender de você debugar 3 tecnologias novas ao mesmo tempo sob prazo fixo.

Nas reuniões/apresentações em grupo, o discurso institucional pode continuar mencionando os 4 nomes como equipe — isso não muda nada tecnicamente aqui.

---

## 2. O problema, o público e a solução

**Problema real escolhido:** eventos escolares (feiras, palestras, reuniões de pais, competições, semanas culturais) hoje são divulgados de forma dispersa (mural, grupo de WhatsApp, boca a boca). Isso gera: baixa adesão, gente que não sabe que pode se inscrever, coordenação sem controle de quantos vão comparecer, e nenhum histórico de participação.

**Público-alvo:**
- **Organizador (coordenação/professor)** — cria e gerencia eventos, controla vagas, registra presença.
- **Participante (aluno)** — vê os eventos abertos, se inscreve, recebe confirmação.

**Proposta de valor:** um só lugar onde a escola publica eventos com vagas limitadas, o aluno se inscreve em segundos sem precisar de login, e a coordenação sabe exatamente quem vai e quem compareceu.

**Diferencial para o pitch:** controle de vagas em tempo real + check-in de presença no dia do evento (isso sozinho já justifica a existência do banco de dados de forma bem visual na apresentação).

---

## 3. Escopo do MVP

### 3.1 Dentro do MVP (essencial — se isso não estiver pronto, não há entrega)
- CRUD de eventos (criar, listar, editar, excluir) pelo organizador.
- Categorias de evento (Palestra, Feira, Reunião, Cultural, Esportivo, Competição) com CRUD simples.
- Listagem pública dos eventos abertos (home).
- Página de detalhes do evento.
- Inscrição do participante (nome, e-mail, turma) sem necessidade de conta/login.
- Controle de vagas: capacidade total x vagas ocupadas, bloqueio automático quando esgotar.
- Impedir inscrição duplicada da mesma pessoa (mesmo e-mail) no mesmo evento.
- Painel do organizador: lista de inscritos por evento.
- Check-in de presença (marcar presença manualmente na lista de inscritos).
- Login simples do organizador (usuário único, senha com hash).

### 3.2 Desejável (só se sobrar tempo — ver cronograma)
- Encerramento automático de evento por data (cron simples ou checagem na consulta).
- Exportar lista de inscritos em CSV.
- Busca por texto e filtro por data na home (o filtro por categoria já faz parte do MVP — ver rota `/` na seção 6.1).
- Página "meus eventos" pelo e-mail digitado (sem senha, é só filtro).

### 3.3 Fora do escopo (não implementar — decisão consciente para não perder tempo)
- Notificações por e-mail/push.
- Múltiplos organizadores com permissões diferentes.
- App mobile nativo (o projeto é web).
- Pagamento/inscrição paga.
- Upload de imagens de evento.

---

## 4. Stack tecnológica (decisão final e por quê)

| Camada | Escolha | Por quê |
|---|---|---|
| Runtime | Node.js (LTS) | Já instalado, você já usa no VS Code. |
| Back-end | Express 4 | Mínimo boilerplate, muita documentação, fácil de debugar sozinho. |
| Views | EJS (renderização no servidor) | Evita construir uma API separada + SPA. Um único projeto, um único processo, menos coisa para quebrar. Formulários HTML puro fazem o CRUD. |
| Banco de dados | SQLite via `better-sqlite3` | Zero instalação de servidor de banco (nada de configurar MySQL/Postgres em outra máquina). API síncrona, sem `callback hell`, ótimo para quem está começando. O arquivo `.db` fica dentro do projeto. |
| Autenticação | `bcryptjs` + `express-session` | Só existe **um** usuário organizador. Sessão simples, sem JWT, sem OAuth. `bcryptjs` é a versão em JavaScript puro do `bcrypt` (mesma API, mesmo algoritmo): não precisa compilar nada no Windows. |
| Config | `dotenv` | Variáveis de ambiente (porta, segredo da sessão). |
| Dev | `nodemon` | Reinício automático durante o desenvolvimento. |
| Front-end estático | CSS puro (sem framework) | Ver seção 9 (identidade visual). Não usar Bootstrap/Tailwind para não gastar tempo aprendendo outra ferramenta agora. |
| Controle de versão | Git + GitHub | Um repositório, commits pequenos e frequentes (ver seção 11). |

**Por que não React/TypeScript aqui:** seus outros projetos pessoais (WeatherFlow, App de Evolução Pessoal) usam React Native/TypeScript porque são projetos de portfólio sem prazo apertado. Este é um projeto de disciplina com entrega fixa em 04/12 e você sozinho — a prioridade é **funcionar e estar bem documentado**, não usar a stack mais moderna.

Também expomos uma **camada de API JSON somente-leitura** (seção 6.4) para satisfazer literalmente o item "API/rotas do Back-End" do plano do professor, mesmo com a aplicação sendo majoritariamente server-rendered.

---

## 5. Modelagem de dados

### 5.1 Entidades e relacionamentos (DER textual)

```
categorias (1) ────< (N) eventos
eventos    (1) ────< (N) inscricoes
participantes (1) ──< (N) inscricoes
usuarios  (organizador — tabela isolada, sem relacionamento)
```

- Um evento pertence a **uma** categoria.
- Um evento pode ter **várias** inscrições.
- Um participante pode ter **várias** inscrições (em eventos diferentes), mas **não pode se inscrever duas vezes no mesmo evento** (chave única composta).

### 5.2 Dicionário de dados

**usuarios**
| Campo | Tipo | Regra |
|---|---|---|
| id | INTEGER PK | autoincremento |
| nome | TEXT | obrigatório |
| email | TEXT | único, obrigatório |
| senha_hash | TEXT | obrigatório (bcrypt) |
| criado_em | TEXT | default `CURRENT_TIMESTAMP` |

**categorias**
| Campo | Tipo | Regra |
|---|---|---|
| id | INTEGER PK | autoincremento |
| nome | TEXT | único, obrigatório |

**eventos**
| Campo | Tipo | Regra |
|---|---|---|
| id | INTEGER PK | autoincremento |
| titulo | TEXT | obrigatório |
| descricao | TEXT | opcional |
| categoria_id | INTEGER FK → categorias.id | obrigatório |
| data_evento | TEXT (YYYY-MM-DD) | obrigatório |
| hora_inicio | TEXT (HH:MM) | obrigatório |
| hora_fim | TEXT (HH:MM) | opcional |
| local | TEXT | obrigatório |
| capacidade | INTEGER | obrigatório, > 0 |
| status | TEXT | `aberto` \| `encerrado` — default `aberto` |
| criado_em | TEXT | default `CURRENT_TIMESTAMP` |

*(vagas ocupadas não é uma coluna — é calculada por `COUNT(inscricoes)` para nunca ficar desincronizada; ver seção 7)*

**participantes**
| Campo | Tipo | Regra |
|---|---|---|
| id | INTEGER PK | autoincremento |
| nome | TEXT | obrigatório |
| email | TEXT | **único**, obrigatório (salvo sempre em minúsculas) |
| turma | TEXT | obrigatório |

*(o e-mail identifica a pessoa: se o aluno já se inscreveu em outro evento, o cadastro existente é reaproveitado em vez de criar outra linha. Sem isso, a `UNIQUE(evento_id, participante_id)` de `inscricoes` nunca pegaria duplicidade, porque cada inscrição criaria um participante novo com id diferente)*

**inscricoes**
| Campo | Tipo | Regra |
|---|---|---|
| id | INTEGER PK | autoincremento |
| evento_id | INTEGER FK → eventos.id | obrigatório, `ON DELETE CASCADE` |
| participante_id | INTEGER FK → participantes.id | obrigatório |
| data_inscricao | TEXT | default `CURRENT_TIMESTAMP` |
| presenca_confirmada | INTEGER (0/1) | default 0 |
| UNIQUE(evento_id, participante_id) | | impede inscrição duplicada |

### 5.3 Script SQL (DDL completo)

O arquivo real é `src/schema.sql`. Ele é executado pelo `db.js` **toda vez que o servidor sobe**, por isso usa `CREATE TABLE IF NOT EXISTS` (rodar duas vezes não dá erro) e **não** contém `INSERT` — os dados iniciais ficam no `seed.js`.

> ⚠️ O SQLite vem com chaves estrangeiras **desligadas** por padrão. O `db.js` executa `PRAGMA foreign_keys = ON` logo ao abrir a conexão; sem isso, `FOREIGN KEY` e `ON DELETE CASCADE` são ignorados silenciosamente.

```sql
CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS categorias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS eventos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria_id INTEGER NOT NULL,
  data_evento TEXT NOT NULL,
  hora_inicio TEXT NOT NULL,
  hora_fim TEXT,
  local TEXT NOT NULL,
  capacidade INTEGER NOT NULL CHECK (capacidade > 0),
  status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto','encerrado')),
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS participantes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  turma TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS inscricoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evento_id INTEGER NOT NULL,
  participante_id INTEGER NOT NULL,
  data_inscricao TEXT DEFAULT CURRENT_TIMESTAMP,
  presenca_confirmada INTEGER NOT NULL DEFAULT 0 CHECK (presenca_confirmada IN (0,1)),
  FOREIGN KEY (evento_id) REFERENCES eventos(id) ON DELETE CASCADE,
  FOREIGN KEY (participante_id) REFERENCES participantes(id),
  UNIQUE (evento_id, participante_id)
);
```

**Seed (`npm run seed`, arquivo `src/seed.js`):**
- Insere as categorias padrão (Palestra, Feira, Reunião, Cultural, Esportivo, Competição) com `INSERT OR IGNORE` — pode rodar quantas vezes quiser sem duplicar.
- Cria o usuário organizador com nome, e-mail e senha lidos do `.env` (`ADMIN_NOME`, `ADMIN_EMAIL`, `ADMIN_SENHA`). A senha passa por `bcrypt.hash` antes de ir para o banco — nunca fica em texto puro nem no código.

---

## 6. Rotas do Back-End

### 6.1 Públicas
| Método | Rota | Ação |
|---|---|---|
| GET | `/` | Home — lista eventos com status `aberto`, filtro por categoria (query `?categoria=`) |
| GET | `/eventos/:id` | Detalhes do evento + vagas restantes |
| GET | `/eventos/:id/inscrever` | Formulário de inscrição |
| POST | `/eventos/:id/inscrever` | Processa inscrição (valida vaga e duplicidade) |
| GET | `/eventos/:id/confirmacao` | Página de confirmação pós-inscrição. Os dados da inscrição recém-feita vêm da **sessão** (`req.session.ultimaInscricao`), não da URL — assim ninguém troca um número no endereço e vê o nome/e-mail de outro aluno. |

### 6.2 Autenticação
| Método | Rota | Ação |
|---|---|---|
| GET | `/admin/login` | Formulário de login |
| POST | `/admin/login` | Autentica e cria sessão |
| POST | `/admin/logout` | Destroi sessão |

### 6.3 Painel do organizador (protegidas por middleware `requireAuth`)
| Método | Rota | Ação |
|---|---|---|
| GET | `/admin` | Dashboard — total de eventos, próximos eventos, inscrições recentes |
| GET | `/admin/eventos` | Lista todos os eventos (qualquer status) |
| GET | `/admin/eventos/novo` | Formulário de criação |
| POST | `/admin/eventos` | Cria evento |
| GET | `/admin/eventos/:id/editar` | Formulário de edição |
| POST | `/admin/eventos/:id` | Atualiza evento |
| POST | `/admin/eventos/:id/excluir` | Exclui evento (e inscrições em cascata) |
| GET | `/admin/eventos/:id/inscritos` | Lista de inscritos + botão de check-in |
| POST | `/admin/inscricoes/:id/presenca` | Alterna presença confirmada (0/1) |
| GET | `/admin/categorias` | Lista categorias |
| POST | `/admin/categorias` | Cria categoria |
| POST | `/admin/categorias/:id/excluir` | Exclui categoria (bloquear se houver evento vinculado) |

### 6.4 API JSON (somente leitura — demonstra a camada de API pedida no plano)
| Método | Rota | Retorno |
|---|---|---|
| GET | `/api/eventos` | Lista de eventos abertos em JSON |
| GET | `/api/eventos/:id` | Detalhes de um evento em JSON |
| GET | `/api/eventos/:id/inscritos` | Lista de inscritos em JSON — **protegida por `requireAuth`** (contém nome, e-mail e turma de alunos menores de idade; não pode ficar pública — LGPD). Na demonstração, abrir já logado no painel. |

---

## 7. Regras de negócio (o que validar no código, não confiar no formulário)

1. **Vagas:** antes de gravar uma inscrição, calcular `COUNT(*) FROM inscricoes WHERE evento_id = ?` e comparar com `capacidade`. Se `>=`, recusar com mensagem clara. A contagem e o `INSERT` rodam **dentro da mesma transação** (`db.transaction(...)` do `better-sqlite3`), para que duas inscrições simultâneas não ocupem a última vaga ao mesmo tempo.
2. **Duplicidade:** o e-mail é normalizado (`trim()` + minúsculas) antes de qualquer consulta. Verificar se já existe `inscricoes` com o mesmo `evento_id` + e-mail do participante (via join com `participantes`) antes de inserir; a constraint `UNIQUE` do banco é a segunda linha de defesa, não a primeira. Se o e-mail já existe em `participantes`, reaproveitar esse participante (ver seção 5.2).
3. **Evento encerrado:** se `status = 'encerrado'` ou `data_evento` já passou, bloquear novas inscrições mesmo que existam vagas. Comparar com a data **local** (`date('now', 'localtime')` no SQLite): `date('now')` sozinho usa UTC e, depois das 21h no horário de Brasília, já "virou o dia".
4. **Exclusão de evento:** ao excluir um evento, excluir também suas inscrições (ou usar `ON DELETE CASCADE` na FK — preferível).
5. **Exclusão de categoria:** só permitir excluir se nenhum evento estiver vinculado a ela.
6. **Senha do organizador:** nunca armazenar em texto puro — sempre `bcrypt.hash` na criação/seed e `bcrypt.compare` no login.
7. **Sessão:** todas as rotas `/admin/*` (exceto `/admin/login`) e a rota `/api/eventos/:id/inscritos` passam pelo middleware `requireAuth`, que redireciona para login se não houver sessão ativa.

---

## 8. Fluxo de telas (protótipo em texto)

```
Home (/) 
 └─ lista de cards de evento (título, categoria, data, vagas restantes)
     └─ clique → Detalhes do evento (/eventos/:id)
                  └─ botão "Inscrever-se" → Formulário (/eventos/:id/inscrever)
                                              └─ envio → Confirmação (/eventos/:id/confirmacao)

Login (/admin/login) → Dashboard (/admin)
                          ├─ Eventos (/admin/eventos) → Novo/Editar → Inscritos/Check-in
                          └─ Categorias (/admin/categorias)
```

**Telas mínimas a desenhar no protótipo da etapa 3 do cronograma (papel, Figma ou só HTML estático):**
1. Home com lista de eventos.
2. Detalhes do evento.
3. Formulário de inscrição.
4. Confirmação de inscrição.
5. Login do organizador.
6. Lista de eventos (admin).
7. Formulário de criar/editar evento.
8. Lista de inscritos com check-in.

---

## 9. Identidade visual

| Elemento | Valor |
|---|---|
| Cor primária | `#2563EB` (azul institucional) |
| Cor de apoio | `#10B981` (verde — usado só em confirmações/sucesso) |
| Cor de alerta | `#EF4444` (vagas esgotadas, erros) |
| Fundo | `#F8FAFC` |
| Texto principal | `#1E293B` |
| Tipografia | `Poppins` (títulos) + `Inter` (texto) — Google Fonts, carregar via `<link>` |
| Estilo de card | cantos arredondados (`border-radius: 12px`), sombra leve, sem gradientes chamativos — visual "painel de secretaria escolar", limpo e sério |
| Badge de status | pílula colorida: verde "Vagas disponíveis", cinza "Encerrado", vermelho "Esgotado" |

Usar **um único arquivo** `public/css/style.css`, sem framework, para manter o projeto simples de explicar na apresentação.

---

## 10. Estrutura de pastas

```
Projeto-Integrador-2-TDS/
├── CLAUDE.md
├── README.md                     # instruções de instalação (espelho da seção 16)
├── .env                          # segredos reais — NÃO versionar (está no .gitignore)
├── .env.example                  # modelo do .env, sem segredos — versionado
├── .gitignore
├── package.json
├── docs/                         # PRD, ARCHITECTURE, RULES, DESIGN, TASKS, MEMORY
├── data/
│   └── eventos.db                # banco SQLite, criado automaticamente — NÃO versionar (está no .gitignore)
├── src/
│   ├── server.js                 # ponto de entrada
│   ├── db.js                     # conexão better-sqlite3 + execução do schema.sql
│   ├── schema.sql                # DDL da seção 5.3
│   ├── seed.js                   # cria categorias padrão + usuário organizador
│   ├── seed-demo.js              # eventos e inscrições de exemplo (npm run seed:demo)
│   ├── validacoes.js             # validação dos formulários (docs/RULES.md §2)
│   ├── middlewares/
│   │   ├── requireAuth.js
│   │   └── carregarEvento.js     # busca o evento do :id ou responde 404
│   ├── routes/
│   │   ├── public.js              # home, detalhes, inscrição
│   │   ├── admin.js                # dashboard, eventos, categorias, inscritos
│   │   ├── auth.js                 # login/logout
│   │   └── api.js                  # rotas JSON
│   └── repositories/
│       ├── eventosRepo.js
│       ├── categoriasRepo.js
│       ├── participantesRepo.js
│       ├── inscricoesRepo.js
│       └── usuariosRepo.js
├── views/                         # EJS
│   ├── partials/ (header, footer, badge-evento)
│   ├── public/ (home, evento, inscrever, confirmacao, 404, erro)
│   └── admin/ (login, dashboard, eventos-lista, evento-form, inscritos, categorias)
└── public/
    ├── css/style.css
    └── js/confirmar.js            # só o confirm() antes de excluir — tudo funciona sem JS
```

**Convenção:** nenhuma rota fala direto com `better-sqlite3` — sempre passa por um `repository`. Isso deixa o código organizado e fácil de explicar linha a linha na banca.

---

## 11. Convenções de código e Git

- **Commits pequenos e descritivos**, em português, no padrão: `feat: cria CRUD de eventos`, `fix: impede inscrição duplicada`, `docs: atualiza schema no CLAUDE.md`.
- Commit ao final de **cada etapa concluída do cronograma** (mínimo), nunca um commit gigante no fim.
- Branch única (`main`) é suficiente para um projeto solo — não complicar com múltiplas branches.
- Nomes de variáveis e rotas em português (coerente com o domínio do projeto: `eventos`, `inscricoes`, não `events`, `subscriptions`).

---

## 12. Cronograma solo (adaptado do plano do professor)

O plano do professor pressupõe 4 pessoas trabalhando em paralelo. Como você faz tudo sozinho, o volume por semana foi reordenado para ser sequencial e realista — os **prazos de entrega continuam os mesmos do plano oficial**, mas o "o que fazer em cada semana" foi redecidido:

| Semana | Foco solo | Entrega da semana |
|---|---|---|
| 29/09–02/10 | Escrever problema, público, proposta de valor (seção 2 já pronta aqui) | Ficha do projeto |
| 06–09/10 | Fechar escopo do MVP (seção 3 já pronta) + começar a estrutura de pastas e `npm init` | Requisitos + projeto inicializado |
| 14–16/10 | Desenhar as 8 telas da seção 8 (pode ser wireframe simples em papel/Figma) | Protótipo |
| 20–23/10 | Rodar o `schema.sql`, criar `db.js`, testar as tabelas manualmente | Banco criado e testado |
| 27–30/10 | CRUD de eventos e categorias (rotas admin) | CRUD funcional |
| 03–06/11 | Rotas públicas (home, detalhes, inscrição) + regras de negócio (seção 7) | Fluxo público completo |
| 10–13/11 | Login, sessão, middleware `requireAuth`, painel de inscritos + check-in | Sistema integrado |
| 17–19/11 | Rotas da API JSON (seção 6.4) + revisão de bugs | MVP completo |
| 24–27/11 | Popular banco com dados de teste realistas, revisar CSS, escrever documentação final | Versão candidata |
| 01–04/12 | Testes finais, ensaio do pitch, apresentação | Entrega — TDS Innovation Day |

---

## 13. Checklist de entrega (04/12)

- [x] Problema e público-alvo definidos
- [ ] Protótipo das 8 telas
- [x] `schema.sql` executando sem erro, com dados de teste
- [x] CRUD de eventos e categorias funcionando (admin)
- [x] Fluxo público de inscrição funcionando, com bloqueio de vaga esgotada e duplicidade
- [x] Login do organizador funcionando com sessão
- [x] Check-in de presença funcionando
- [x] Rotas `/api/*` respondendo JSON válido
- [ ] README/CLAUDE.md atualizado refletindo o estado real do código
- [ ] Você consegue explicar cada rota e cada tabela sem consultar nada

---

## 14. Roteiro do pitch (TDS Innovation Day)

1. Apresentação do grupo e do problema (30s).
2. Demonstração: abrir a home, mostrar evento com vagas, fazer uma inscrição ao vivo.
3. Mostrar o mesmo evento chegando a 0 vagas (ter um evento de teste com capacidade = 1 preparado).
4. Trocar para o painel admin: mostrar o CRUD, a lista de inscritos e fazer o check-in ao vivo.
5. Mostrar rapidamente o `schema.sql` e explicar a relação `eventos → inscricoes → participantes`.
6. Chamar a rota `/api/eventos` no navegador para mostrar o JSON (prova de "API" funcionando).
7. Encerrar com "próximos passos" (seção 3.2/backlog).

---

## 15. Backlog pós-MVP (não fazer agora, só citar se perguntarem)

- Notificação por e-mail na confirmação de inscrição.
- Exportação CSV dos inscritos.
- Múltiplos organizadores com papéis diferentes.
- Encerramento automático de evento por data via job agendado.

---

## 16. Instruções de instalação e execução

Esta seção é a parte de "documentação" exigida no item 9 do plano do professor (DER, SQL, API e instruções). Deve virar também o `README.md` do repositório.

### 16.1 Pré-requisitos
- Node.js LTS instalado (já ✅ no seu ambiente).
- Git instalado (já ✅).

### 16.2 Dependências (`package.json`)

O arquivo real é o `package.json` na raiz — não copiar a lista para cá (ela desatualiza). O que está instalado:

| Pacote | Versão | Para quê |
|---|---|---|
| `express` | 4.x | servidor e rotas |
| `express-session` | 1.x | sessão do organizador |
| `ejs` | 6.x | views renderizadas no servidor |
| `better-sqlite3` | 13.x | banco SQLite (a 11.x não tem binário pronto para o Node 24) |
| `bcryptjs` | 3.x | hash da senha (ver seção 4) |
| `dotenv` | 18.x | lê o `.env` |
| `nodemon` (dev) | 3.x | reinicia o servidor ao salvar |

Scripts: `npm start` (produção), `npm run dev` (desenvolvimento), `npm run seed` (dados iniciais), `npm run seed:demo` (eventos e inscrições de exemplo — só roda com o banco sem eventos).

> O npm 11 bloqueia scripts de instalação por padrão. O `better-sqlite3` precisa do dele (baixa o binário nativo), por isso o `package.json` tem `"allowScripts": { "better-sqlite3@13.0.3": true }`. Se atualizar a versão do pacote, rodar `npm approve-scripts better-sqlite3` de novo.

### 16.3 Variáveis de ambiente (`.env`)

Copiar de `.env.example` (que é versionado) e preencher. O `.env` real nunca vai para o Git.

```
PORT=3333
SESSION_SECRET=         # texto aleatório longo — gerar com o comando abaixo
DB_PATH=./data/eventos.db

ADMIN_NOME=Coordenação
ADMIN_EMAIL=organizador@escola.com
ADMIN_SENHA=            # senha do organizador, usada só pelo seed
```

Gerar um `SESSION_SECRET`: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

A porta padrão é **3333** porque a 3000 costuma estar ocupada por outros projetos na máquina. Se a porta estiver em uso, o servidor avisa e para.

### 16.4 Passo a passo (primeira vez)
```bash
git clone <url-do-repositorio>
cd <pasta-do-repositorio>
npm install
cp .env.example .env   # depois abrir o .env e preencher SESSION_SECRET e ADMIN_SENHA
npm run seed           # cria as tabelas (schema.sql), categorias padrão e o usuário organizador
npm run seed:demo      # opcional: 7 eventos e 32 inscrições de exemplo
npm run dev            # inicia em http://localhost:3333
```

### 16.5 Login do organizador (criado pelo seed)
| Campo | Valor |
|---|---|
| E-mail | o `ADMIN_EMAIL` do `.env` (padrão: `organizador@escola.com`) |
| Senha | o `ADMIN_SENHA` do `.env` |

A senha **não** fica no código (`seed.js` é versionado e iria parar no GitHub) — só no `.env`, e no banco apenas como hash. Trocar a senha = mudar `ADMIN_SENHA` no `.env` e resetar o banco (16.6); não existe tela de troca de senha no MVP.

### 16.6 Resetar o banco (se precisar recomeçar do zero)
```bash
rm data/eventos.db
npm run seed
npm run seed:demo      # opcional — antes do pitch, para ter dados limpos de demonstração
```
Apaga **todos** os eventos e inscrições. Com o servidor rodando, pará-lo antes (o Windows não deixa apagar arquivo aberto).

### 16.7 `.gitignore`
```
node_modules/
.env
data/*.db
data/*.db-*
```
