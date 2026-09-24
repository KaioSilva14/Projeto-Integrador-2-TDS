# Regras — Sistema de Eventos Escolares

> Regras de negócio, validações, segurança e convenções de código.
> **Toda regra é conferida no servidor.** O formulário (`required`, `maxlength`…) só ajuda o usuário — nunca é a proteção.

---

## 1. Regras de negócio

Os códigos são citados no código (`// RN01`) e no [PRD.md](PRD.md). As mensagens entre aspas são **exatamente** o texto mostrado ao usuário.

### RN01 — Vagas
Uma inscrição só é aceita se `COUNT(inscricoes do evento) < capacidade`.
- A contagem e o `INSERT` rodam na **mesma** `db.transaction(...)`.
- Mensagem: **"As vagas deste evento esgotaram."**
- Onde: `inscricoesRepo.inscrever`.
- Teste: evento com capacidade 1 → primeira inscrição passa, a segunda recebe a mensagem.

### RN02 — Uma inscrição por pessoa por evento
A pessoa é identificada pelo e-mail, normalizado com `trim().toLowerCase()` **antes** de qualquer consulta.
- Verificar primeiro no código (join `inscricoes` + `participantes`); a `UNIQUE` do banco é a segunda linha de defesa.
- E-mail já existente em `participantes` → reaproveitar o participante (e atualizar nome/turma com o que foi digitado agora).
- Mensagem: **"Este e-mail já está inscrito neste evento."**
- Onde: `inscricoesRepo.inscrever`.
- Teste: inscrever `Ana@Escola.com` e depois `ana@escola.com ` no mesmo evento → recusado.

### RN03 — Evento encerrado
Não aceita inscrição se `status = 'encerrado'` **ou** `data_evento < date('now', 'localtime')`, mesmo com vagas.
- Mensagem: **"As inscrições para este evento estão encerradas."**
- Onde: `inscricoesRepo.inscrever` (bloqueio) e `public/evento` (esconder o botão).
- Teste: evento com data de ontem → sem botão; POST direto → recusado.

### RN04 — Excluir evento apaga as inscrições
Garantido pelo banco (`ON DELETE CASCADE`). A tela avisa quantas inscrições serão apagadas antes de confirmar.
- Teste: evento com 2 inscrições → excluir → `SELECT COUNT(*) FROM inscricoes WHERE evento_id = ?` dá 0.

### RN05 — Categoria em uso não pode ser excluída
Conferir `COUNT(eventos da categoria)` antes; o `ON DELETE RESTRICT` do banco é a segunda defesa.
- Mensagem: **"Não é possível excluir: N evento(s) usam esta categoria."**
- Onde: rota `POST /admin/categorias/:id/excluir`.

### RN06 — Senha do organizador
- Gravar só `bcrypt.hashSync(senha, 10)`; conferir com `bcrypt.compareSync`.
- A senha vem do `.env` (`ADMIN_SENHA`) e só o `seed.js` a lê.
- Login errado: **"E-mail ou senha incorretos."** — nunca dizer qual dos dois.

### RN07 — Rotas protegidas
Passam por `requireAuth`: todas as `/admin/*` **exceto** `GET` e `POST /admin/login`, e também `GET /api/eventos/:id/inscritos`.

### RN08 — Capacidade não pode ficar abaixo dos inscritos
Ao editar um evento, `capacidade` nova ≥ inscritos atuais.
- Mensagem: **"A capacidade não pode ser menor que o número de inscritos (N)."**

### RN09 — Confirmação só para quem acabou de se inscrever
A página de confirmação lê `req.session.ultimaInscricao` e apaga depois de mostrar. Sem esse dado na sessão (ou de outro evento) → redireciona para `/eventos/:id`.

### RN10 — Evento novo não pode ser no passado
Ao **criar**, `data_evento` ≥ hoje. (Ao editar pode, para corrigir um evento antigo.)
- Mensagem: **"A data do evento não pode estar no passado."**

---

## 2. Validação de formulários

Remover espaços das pontas (`trim()`) de todo texto antes de validar. Campo que só tem espaço conta como vazio.

### Inscrição
| Campo | Regra | Mensagem |
|---|---|---|
| nome | obrigatório, 3 a 100 caracteres | "Informe seu nome completo." |
| email | obrigatório, formato `algo@algo.algo`, até 120 caracteres | "Informe um e-mail válido." |
| turma | obrigatório, até 20 caracteres (ex.: `2º TDS`) | "Informe sua turma." |

### Evento
| Campo | Regra | Mensagem |
|---|---|---|
| titulo | obrigatório, até 120 caracteres | "Informe o título do evento." |
| descricao | opcional, até 2000 caracteres | "A descrição pode ter até 2000 caracteres." |
| categoria_id | obrigatório, precisa existir na tabela | "Escolha uma categoria." |
| data_evento | obrigatório, data válida `YYYY-MM-DD` (+ RN10) | "Informe uma data válida." |
| hora_inicio | obrigatório, `HH:MM` | "Informe o horário de início." |
| hora_fim | opcional; se preenchido, maior que `hora_inicio` | "O horário de término deve ser depois do início." |
| local | obrigatório, até 120 caracteres | "Informe o local." |
| capacidade | inteiro de 1 a 10000 (+ RN08) | "A capacidade deve ser um número maior que zero." |
| status | `aberto` ou `encerrado` | — (valor fora disso vira `aberto`) |

### Categoria
| Campo | Regra | Mensagem |
|---|---|---|
| nome | obrigatório, até 40 caracteres, único (sem diferenciar maiúsculas) | "Já existe uma categoria com esse nome." |

### Ids na URL
`Number(req.params.id)`; se não for inteiro positivo → 404, sem ir ao banco.

---

## 3. Segurança

1. **SQL sempre com parâmetros `?`.** Nunca montar SQL juntando texto digitado pelo usuário. Concatenar pedaços **fixos** de SQL (como no filtro de categoria do `eventosRepo`) é permitido.
2. **Na view, sempre `<%= %>`** (escapa HTML). `<%- %>` só para `include`. Assim um aluno que digite `<script>` no nome não executa nada na tela do organizador.
3. **Segredos só no `.env`** — senha, `SESSION_SECRET`. O `.env` está no `.gitignore`. Nunca escrever senha em código, doc ou commit.
4. **Não logar dados sensíveis** — nada de `console.log(req.body)` no login.
5. **Dados de alunos só para o organizador logado** (RN07). A API pública não devolve e-mail nem turma.
6. **Mensagem de erro genérica para o usuário**; detalhe técnico só no console do servidor.

---

## 4. Convenções de código

### Nomes
- Tudo do domínio em **português**: `eventos`, `inscricoes`, `listarAbertos`, `categoriaSelecionada`.
- Variáveis e funções em `camelCase`; colunas e tabelas do banco em `snake_case`.
- Arquivos de repository: `<entidade>Repo.js`, no plural (`eventosRepo.js`).
- Funções de repository começam com verbo:

| Verbo | Uso |
|---|---|
| `listar…` | várias linhas (`listarAbertos`, `listarPorEvento`) |
| `buscarPor…` | uma linha ou `undefined` (`buscarPorId`, `buscarPorEmail`) |
| `contar…` | um número |
| `criar`, `atualizar`, `excluir` | escrita |

### Estilo
- 2 espaços, aspas simples, ponto e vírgula, `const` por padrão (`let` só quando reatribui).
- SQL em **MAIÚSCULAS** para palavras-chave, alias curtos (`e`, `c`, `i`).
- Comentário explica o **porquê**, não o óbvio. Citar a regra quando existir: `// RN01`.
- Uma rota = um bloco pequeno. Se passar de ~30 linhas, a lógica provavelmente pertence ao repository.
- CommonJS (`require` / `module.exports`), igual ao resto do projeto.

### Views
- Toda página começa com `include('../partials/header', { titulo })` e termina com o `footer`.
- Formatar datas (`dd/mm/aaaa`) na view, a partir do texto `YYYY-MM-DD` do banco.
- Classes CSS em português e com hífen (`lista-eventos`, `badge-esgotado`) — ver [DESIGN.md](DESIGN.md).

### Git
- Mensagens em português: `feat: …`, `fix: …`, `docs: …`, `style: …`, `refactor: …`, `chore: …`.
- Um commit por tarefa concluída do [TASKS.md](TASKS.md) — pequeno o suficiente para explicar numa frase.
- Branch única `main`.

---

## 5. Antes de cada commit

- [ ] `npm run dev` sobe sem erro e a página alterada abre.
- [ ] Testei o caminho feliz **e** pelo menos um erro (campo vazio, id inexistente…).
- [ ] Nenhum SQL fora de `repositories/`.
- [ ] Nenhuma senha/segredo no diff (`git diff --staged`).
- [ ] Tarefa marcada no [TASKS.md](TASKS.md); decisão nova anotada no [MEMORY.md](MEMORY.md).
