# Memória do projeto

> O que já foi decidido, o que já deu problema (e como resolveu) e o que aconteceu em cada sessão.
> Serve para não repetir erro e para lembrar **por que** algo é do jeito que é. Atualizar ao fim de cada sessão de trabalho.
> **Nunca** escrever senha ou segredo aqui — este arquivo vai para o GitHub.

---

## Estado atual

*Atualizado em 24/09/2026.*

- Fundação pronta: projeto inicializado, banco (`schema.sql`, `db.js`, `seed.js`) funcionando e testado, home listando eventos.
- Documentação completa em `docs/` + `README.md`.
- Ainda não existe: detalhes/inscrição, login, painel, API. Ver [TASKS.md](TASKS.md).
- Git local com commits; **ainda sem repositório no GitHub**.

---

## Decisões

A tabela completa com alternativas está em [ARCHITECTURE.md §8](ARCHITECTURE.md#8-decisões-técnicas). Aqui fica o resumo e a data.

| Data | Decisão | Motivo curto |
|---|---|---|
| 24/09 | `bcryptjs` no lugar de `bcrypt` | Não precisa compilar no Windows |
| 24/09 | `participantes.email` é `UNIQUE` e o participante é reaproveitado | Sem isso a duplicidade nunca era detectada |
| 24/09 | `ON DELETE CASCADE` em `inscricoes.evento_id`, `RESTRICT` em `eventos.categoria_id` | Regras RN04 e RN05 garantidas pelo banco |
| 24/09 | `schema.sql` sem `INSERT` e com `IF NOT EXISTS`; dados iniciais no `seed.js` | Roda a cada inicialização sem erro |
| 24/09 | Senha do organizador só no `.env` | `seed.js` vai para o GitHub |
| 24/09 | Porta 3333 | 3000 ocupada por outro projeto |
| 24/09 | `/api/eventos/:id/inscritos` exige login | Dados de menores de idade (LGPD) |
| 24/09 | Confirmação de inscrição lida da sessão | Não expor dados trocando o id na URL |
| 24/09 | Tons escuros para texto verde/vermelho (`#047857`, `#B91C1C`, `#DC2626`) | `#10B981` e `#EF4444` não passam no contraste (DESIGN.md) |
| 24/09 | E-mail padrão do organizador: `organizador@escola.com` | Definido no CLAUDE.md §16.5 |

---

## Problemas já resolvidos

Se algo "estranho" acontecer, procurar aqui primeiro.

**`EADDRINUSE: address already in use :::3000`**
Outro programa já usa a porta. Este projeto usa a 3333 (`PORT` no `.env`). O `server.js` mostra uma mensagem clara em vez do erro gigante.

**`better-sqlite3` não carrega / "Could not locate the bindings file"**
O npm 11 bloqueia scripts de instalação por padrão, e o `better-sqlite3` precisa do dele. Solução: `npm approve-scripts better-sqlite3` (fica registrado em `allowScripts` no `package.json`). Ao atualizar a versão do pacote, aprovar de novo.

**`dotenv` imprimindo "injected env (N) from .env" toda hora**
O dotenv 17+ faz isso por padrão. Usamos `require('dotenv').config({ quiet: true })`.

**`FOREIGN KEY` e `ON DELETE CASCADE` "não funcionam" no SQLite**
Vêm desligados. O `db.js` executa `PRAGMA foreign_keys = ON` — nunca remover.

**Evento de hoje sumindo da home à noite**
`date('now')` no SQLite é UTC (3 h à frente). Sempre `date('now', 'localtime')`.

**Não consigo apagar `data/eventos.db`**
O Windows trava o arquivo enquanto o servidor está rodando. Parar o `npm run dev` (Ctrl+C) antes.

**Skill Impeccable: clone do repositório falha com "Filename too long"**
Só a pasta de testes do repositório tem caminhos longos demais para o Windows. A skill em si (`.claude/skills/impeccable`) foi recuperada separadamente e está completa.

---

## Perguntas em aberto

- [ ] **Quantos integrantes?** O CLAUDE.md diz "4 integrantes no papel", mas a ficha lista 3 nomes (Heitor Eckel, Kaio Silva, Samuel Donato). Falta um nome ou o número está errado?
- [ ] **URL do GitHub** — criar o repositório e anotar aqui.

---

## Ferramentas instaladas

- **Skills de design do Claude Code** (em `~/.claude/skills/`, valem para todos os projetos):
  - `impeccable` — auditoria e polimento de interface (`/impeccable audit`, `/impeccable polish`…)
  - `emil-design-eng` — acabamento, componentes e animação (Emil Kowalski)
  - `design-taste-frontend` — evita visual "genérico de IA" (Taste Skill)

---

## Diário

### 24/09/2026
- Instaladas as skills de design (impeccable, emil-design-eng, design-taste-frontend).
- Revisado o CLAUDE.md: corrigidos schema (duplicidade, cascata, `IF NOT EXISTS`), segurança (API de inscritos, confirmação), fuso da data, referências quebradas e seção 16 (versões reais, `.env` completo, senha fora do código, porta 3333).
- Projeto inicializado: dependências, estrutura, banco, seed, home com filtro. Testes de constraint no banco passaram.
- Banco resetado para o organizador passar a ser `organizador@escola.com`.
- Criados `docs/` (PRD, ARCHITECTURE, RULES, DESIGN, TASKS, MEMORY) e `README.md`.
- Tokens de cor do DESIGN.md aplicados no `style.css` (sem hex solto).
