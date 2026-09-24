# Tarefas — Sistema de Eventos Escolares

> Lista do que fazer, na ordem do cronograma (CLAUDE.md, seção 12). Abrir no começo de cada aula.
> Marcar `[x]` ao terminar e fazer o commit (RULES.md §5). Códigos HU/RN: [PRD.md](PRD.md) e [RULES.md](RULES.md).

**Legenda:** `[x]` feito · `[ ]` a fazer · 🔸 feito antes do previsto no cronograma

**Situação em 24/09/2026:** o MVP inteiro (seção 3.1 do CLAUDE.md) está implementado e testado — bem antes do previsto. O que falta agora é **entregar cada etapa ao professor no prazo dele**, **entender cada arquivo** (você vai ter que explicar na banca) e **polir** para o pitch.

**Próxima tarefa:** ler o código na ordem sugerida em "Estudo do código" abaixo.

---

## Semana 29/09–02/10 — Ficha do projeto
- [x] Problema, público e proposta de valor (CLAUDE.md §2, PRD.md §1–3)
- [ ] Confirmar o número de integrantes (ver MEMORY.md, "Perguntas em aberto")
- [ ] Entregar a ficha ao professor

## Semana 06–09/10 — Requisitos + projeto inicializado
- [x] Escopo do MVP fechado (CLAUDE.md §3, PRD.md §4)
- [x] 🔸 `npm init`, dependências, scripts `start`/`dev`/`seed`/`seed:demo`
- [x] 🔸 Estrutura de pastas, `.gitignore`, `.env.example`
- [x] 🔸 Git + repositório no GitHub (`KaioSilva14/Projeto-Integrador-2-TDS`)
- [x] 🔸 Documentação em `docs/` e `README.md`
- [ ] Entregar os requisitos ao professor (o PRD.md serve)

## Semana 14–16/10 — Protótipo
As telas já existem de verdade. Duas opções para a entrega:
(a) prints das telas reais, no celular e no PC; ou (b) wireframes em papel/Figma, se o professor exigir protótipo "antes do código".
- [ ] Perguntar ao professor qual formato ele aceita
- [ ] 1. Home · 2. Detalhes · 3. Inscrição · 4. Confirmação
- [ ] 5. Login · 6. Eventos (admin) · 7. Criar/editar evento · 8. Inscritos com check-in
- [ ] Entregar

## Semana 20–23/10 — Banco criado e testado
- [x] 🔸 `src/schema.sql` com `IF NOT EXISTS`, `CASCADE`, `RESTRICT`, e-mail único
- [x] 🔸 `src/db.js` com `PRAGMA foreign_keys = ON` e `DB_PATH` do `.env`
- [x] 🔸 `src/seed.js` (categorias + organizador com senha do `.env`)
- [x] 🔸 `src/seed-demo.js` + `npm run seed:demo` (inclui evento com capacidade 1 para o pitch)
- [x] 🔸 Testado: duplicidade barrada, categoria em uso protegida, cascata ao excluir evento
- [ ] Tirar prints das tabelas (DB Browser for SQLite ou extensão SQLite do VS Code) para a documentação

## Semana 27–30/10 — CRUD funcional (admin)
- [x] 🔸 Login/logout (`routes/auth.js`, `usuariosRepo`) — HU06, RN06
- [x] 🔸 `requireAuth` em `/admin` e na API de inscritos — RN07
- [x] 🔸 Componentes CSS: `.campo`, `.aviso`, `.tabela`, `.botao-perigo`, `.botao-presenca`
- [x] 🔸 Avisos de sucesso/erro via `req.session.aviso`
- [x] 🔸 Categorias: listar, criar, excluir (bloqueando se em uso) — HU11, RN05
- [x] 🔸 Eventos: listar, criar, editar, encerrar, excluir — HU08–HU10, RN04, RN08, RN10
- [x] 🔸 `validacoes.js` com as regras do RULES.md §2
- [x] 🔸 Página de erro 500

## Semana 03–06/11 — Fluxo público completo
- [x] 🔸 Home com vagas restantes e filtro por categoria — HU01, HU02
- [x] 🔸 Detalhes do evento — HU03, RN03
- [x] 🔸 Inscrição numa transação — HU04, RN01, RN02, RN03
- [x] 🔸 Confirmação lida da sessão — HU05, RN09
- [x] 🔸 Testado em 360 px (celular)
- [ ] Testar num celular de verdade, pela rede da escola (ver MEMORY.md, "Como abrir no celular")

## Semana 10–13/11 — Sistema integrado
- [x] 🔸 Dashboard com resumo — HU07
- [x] 🔸 Lista de inscritos com contador — HU12
- [x] 🔸 Check-in voltando para a mesma linha — HU13
- [x] 🔸 Menu do organizador (Painel, Eventos, Categorias, Ver site, Sair)

## Semana 17–19/11 — MVP completo
- [x] 🔸 API JSON: `/api/eventos`, `/api/eventos/:id`, `/api/eventos/:id/inscritos` (com login) — HU14
- [x] 🔸 Todas as HUs do PRD.md conferidas (teste de ponta a ponta: 60 verificações)
- [x] 🔸 Checklist de segurança (RULES.md §3): SQL parametrizado, HTML escapado, sessão regenerada no login
- [ ] Transformar o teste de ponta a ponta em `npm test` (hoje ele é um script fora do projeto — ver MEMORY.md)

## Semana 24–27/11 — Versão candidata
- [ ] Revisão visual de todas as telas contra o DESIGN.md (`/impeccable audit` ajuda aqui)
- [ ] Prints das telas para a documentação
- [ ] README e CLAUDE.md refletindo o estado real do código

## Semana 01–04/12 — Entrega
- [ ] Ensaiar o roteiro do pitch (CLAUDE.md §14) do começo ao fim, cronometrado
- [ ] Antes de apresentar: resetar o banco, `npm run seed` e `npm run seed:demo`
- [ ] Testar no computador/rede onde vai ser a apresentação
- [ ] Checklist de entrega (CLAUDE.md §13) todo marcado

---

## Estudo do código (para a banca)

Você precisa conseguir explicar cada arquivo sem consultar nada (CLAUDE.md §13). Ordem sugerida — cada passo usa o anterior:

- [ ] `src/schema.sql` — as 5 tabelas e por que cada `UNIQUE`, `CHECK`, `CASCADE`, `RESTRICT`
- [ ] `src/db.js` — conexão, `PRAGMA foreign_keys`, `DB_PATH`
- [ ] `src/seed.js` — `INSERT OR IGNORE`, `bcrypt.hashSync`
- [ ] `src/server.js` — ordem dos middlewares, sessão, `app.locals`, 404/500
- [ ] `src/repositories/eventosRepo.js` — `COUNT` + `LEFT JOIN` + `GROUP BY` para as vagas
- [ ] `src/repositories/inscricoesRepo.js` — a transação da inscrição (é o coração do sistema)
- [ ] `src/validacoes.js` e `src/routes/public.js` — validação, PRG, sessão na confirmação
- [ ] `src/routes/auth.js` e `src/middlewares/requireAuth.js` — login e proteção
- [ ] `src/routes/admin.js` — CRUD e check-in
- [ ] `src/routes/api.js` — JSON e por que a lista de inscritos exige login
- [ ] Uma view de cada tipo: `public/home.ejs`, `admin/evento-form.ejs`, `partials/header.ejs`

## Desejável — só se sobrar tempo
- [ ] Encerramento automático por data (hoje a RN03 já barra a inscrição; aqui seria mudar o `status` também)
- [ ] Exportar inscritos em CSV
- [ ] Busca por texto e filtro por data na home
- [ ] Página "meus eventos" pelo e-mail
