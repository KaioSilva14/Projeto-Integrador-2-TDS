# Tarefas — Sistema de Eventos Escolares

> Lista do que fazer, na ordem do cronograma (CLAUDE.md, seção 12). Abrir no começo de cada aula.
> Marcar `[x]` ao terminar e fazer o commit (RULES.md §5). Códigos HU/RN: [PRD.md](PRD.md) e [RULES.md](RULES.md).

**Legenda:** `[x]` feito · `[ ]` a fazer · 🔸 feito antes do previsto no cronograma

**Próxima tarefa:** protótipo das 8 telas (semana 14–16/10) — ou, se preferir adiantar, CRUD de categorias (semana 27–30/10).

---

## Semana 29/09–02/10 — Ficha do projeto
- [x] Problema, público e proposta de valor (CLAUDE.md §2, PRD.md §1–3)
- [ ] Revisar a ficha com o grupo e confirmar o número de integrantes (ver MEMORY.md, "Perguntas em aberto")
- [ ] Entregar a ficha ao professor

## Semana 06–09/10 — Requisitos + projeto inicializado
- [x] Escopo do MVP fechado (CLAUDE.md §3, PRD.md §4)
- [x] 🔸 `npm init`, dependências, scripts `start`/`dev`/`seed`
- [x] 🔸 Estrutura de pastas, `.gitignore`, `.env.example`
- [x] 🔸 `git init` + primeiro commit
- [x] 🔸 Documentação em `docs/` e `README.md`
- [ ] Criar o repositório no GitHub e fazer o primeiro `git push`

## Semana 14–16/10 — Protótipo
Seguir o [DESIGN.md](DESIGN.md) (tabela "As 8 telas").
- [ ] 1. Home com lista de eventos
- [ ] 2. Detalhes do evento
- [ ] 3. Formulário de inscrição
- [ ] 4. Confirmação de inscrição
- [ ] 5. Login do organizador
- [ ] 6. Lista de eventos (admin)
- [ ] 7. Formulário de criar/editar evento
- [ ] 8. Lista de inscritos com check-in
- [ ] Exportar/fotografar o protótipo para entregar

## Semana 20–23/10 — Banco criado e testado
- [x] 🔸 `src/schema.sql` com `IF NOT EXISTS`, `CASCADE`, `RESTRICT`, e-mail único
- [x] 🔸 `src/db.js` com `PRAGMA foreign_keys = ON` e `DB_PATH` do `.env`
- [x] 🔸 `src/seed.js` (categorias + organizador com senha do `.env`)
- [x] 🔸 Testado: duplicidade barrada, categoria em uso protegida, cascata ao excluir evento
- [ ] Criar `src/seed-demo.js` (+ script `npm run seed:demo`) com eventos e inscrições de exemplo — inclui um evento com capacidade 1 para o pitch
- [ ] Tirar prints das tabelas (DB Browser for SQLite ou extensão SQLite do VS Code) para a documentação

## Semana 27–30/10 — CRUD funcional (admin)
Antes de começar: rotas do admin precisam de login, mas o login é da semana 10–13/11. Para testar agora, **criar o `routes/auth.js` primeiro** (HU06) — é pequeno.
- [ ] `usuariosRepo.buscarPorEmail` + `routes/auth.js` (login/logout) + `views/admin/login.ejs` — HU06, RN06
- [ ] Registrar `requireAuth` em `/admin` no `server.js` — RN07
- [ ] Componentes CSS: `.campo`, `.aviso`, `.tabela`, `.botao-perigo` (DESIGN.md → Components)
- [ ] Aviso de sucesso/erro via `req.session.aviso` (ARCHITECTURE.md §6)
- [ ] `categoriasRepo`: `listarComTotal`, `criar`, `contarEventos`, `excluir` — HU11
- [ ] `views/admin/categorias.ejs` + rotas de categorias — RN05
- [ ] `eventosRepo`: `listarTodos`, `buscarPorId`, `criar`, `atualizar`, `excluir`
- [ ] `views/admin/eventos-lista.ejs` — HU08–HU10
- [ ] `views/admin/evento-form.ejs` (criar e editar no mesmo arquivo) — validações RULES.md §2, RN08, RN10
- [ ] Excluir evento com `confirm()` mostrando quantas inscrições serão apagadas — RN04
- [ ] Handler de erro 500 no `server.js` (ARCHITECTURE.md §7)

## Semana 03–06/11 — Fluxo público completo
- [x] 🔸 `GET /` — home com eventos abertos, vagas restantes e filtro por categoria — HU01, HU02
- [ ] `GET /eventos/:id` + `views/public/evento.ejs` — HU03, RN03
- [ ] `GET /eventos/:id/inscrever` + `views/public/inscrever.ejs` — HU04
- [ ] `inscricoesRepo.inscrever` numa transação — RN01, RN02, RN03
- [ ] `POST /eventos/:id/inscrever` com validação e PRG — HU04
- [ ] `GET /eventos/:id/confirmacao` lendo a sessão — HU05, RN09
- [ ] Testar no celular (ou DevTools em 360 px) — RNF02

## Semana 10–13/11 — Sistema integrado
- [x] 🔸 `src/middlewares/requireAuth.js`
- [ ] `GET /admin` — dashboard com resumo — HU07
- [ ] `inscricoesRepo`: `listarPorEvento`, `alternarPresenca`, `recentes`
- [ ] `views/admin/inscritos.ejs` com contador e botão de presença — HU12
- [ ] `POST /admin/inscricoes/:id/presenca` voltando para `#inscricao-ID` — HU13
- [ ] Link "Painel" / "Sair" no header quando logado

## Semana 17–19/11 — MVP completo
- [ ] `routes/api.js`: `GET /api/eventos`, `GET /api/eventos/:id` — HU14
- [ ] `GET /api/eventos/:id/inscritos` com `requireAuth` — RN07
- [ ] Rodar o checklist de todas as HUs do PRD.md e corrigir o que falhar
- [ ] Passar o checklist de segurança (RULES.md §3) em todas as rotas

## Semana 24–27/11 — Versão candidata
- [ ] Dados de teste realistas (`npm run seed:demo`)
- [ ] Revisão visual de todas as telas contra o DESIGN.md (`/impeccable audit` ajuda aqui)
- [ ] README e CLAUDE.md refletindo o estado real do código
- [ ] Prints das telas para a documentação

## Semana 01–04/12 — Entrega
- [ ] Ensaiar o roteiro do pitch (CLAUDE.md §14) do começo ao fim, cronometrado
- [ ] Resetar o banco e rodar o seed de demonstração antes de apresentar
- [ ] Testar no computador/rede onde vai ser a apresentação
- [ ] Checklist de entrega (CLAUDE.md §13) todo marcado

---

## Desejável — só depois do MVP completo
- [ ] Encerramento automático por data (já barrado na inscrição pela RN03; aqui seria mudar o `status`)
- [ ] Exportar inscritos em CSV
- [ ] Busca por texto e filtro por data na home
- [ ] Página "meus eventos" pelo e-mail
