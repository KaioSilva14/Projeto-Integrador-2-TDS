# Memória do projeto

> O que já foi decidido, o que já deu problema (e como resolveu) e o que aconteceu em cada sessão.
> Serve para não repetir erro e para lembrar **por que** algo é do jeito que é. Atualizar ao fim de cada sessão de trabalho.
> **Nunca** escrever senha ou segredo aqui — este arquivo vai para o GitHub.

---

## Estado atual

*Atualizado em 24/09/2026.*

- **MVP completo e testado**: fluxo público (home, detalhes, inscrição, confirmação), login, painel, CRUD de eventos e categorias, inscritos com check-in, API JSON.
- Teste de ponta a ponta: 60 verificações cobrindo todas as HUs e RNs, todas passando. Telas conferidas em 360 px e 1280 px.
- Banco de desenvolvimento com os dados de demonstração (`npm run seed:demo`).
- GitHub: https://github.com/KaioSilva14/Projeto-Integrador-2-TDS
- Próximo passo: estudar o código ([TASKS.md](TASKS.md), "Estudo do código") e entregar as etapas ao professor.

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
| 24/09 | Participante existente **não** tem nome/turma atualizados numa nova inscrição | Senão, quem digitasse o e-mail de um colega trocaria o nome dele |
| 24/09 | Duplicidade (RN02) é checada antes das vagas (RN01) | Quem já está inscrito num evento lotado recebe a mensagem útil |
| 24/09 | Validação em `validacoes.js`, sem biblioteca | Mais fácil de explicar na banca |
| 24/09 | Botão "Excluir" contornado, não vermelho cheio | Vermelho repetido em cada linha dominava a tela |
| 24/09 | Coluna "Presença" logo após o nome na lista de inscritos | No celular o botão ficava fora da tela |
| 24/09 | Borda dos campos `#8391A5` | `#E2E8F0` tinha contraste 1.2:1 (mínimo para contorno de campo: 3:1) |

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

**Horário da inscrição aparece 3 h adiantado**
`CURRENT_TIMESTAMP` grava em UTC. Ler com `datetime(coluna, 'localtime')` (já feito no `inscricoesRepo`).

**`attempt to write a readonly database`**
Aconteceu ao apagar um `.db` enquanto outro processo ainda o tinha aberto e logo criar outro com o mesmo nome: o Windows deixa o arquivo "pendente de exclusão". Parar o servidor, esperar ele fechar e só então apagar.

**Acentos virando "�" ao testar com `curl` no terminal**
É o terminal do Windows mandando o texto em outra codificação, não o sistema. Pelo navegador os acentos e o "º" são gravados certo (testado com "Cecília Ñuñez Gonçalves", "2º TDS").

**Skill Impeccable: clone do repositório falha com "Filename too long"**
Só a pasta de testes do repositório tem caminhos longos demais para o Windows. A skill em si (`.claude/skills/impeccable`) foi recuperada separadamente e está completa.

---

## Perguntas em aberto

- [ ] **Quantos integrantes?** O CLAUDE.md diz "4 integrantes no papel", mas a ficha lista 3 nomes (Heitor Eckel, Kaio Silva, Samuel Donato). Falta um nome ou o número está errado?
- [x] **URL do GitHub** — https://github.com/KaioSilva14/Projeto-Integrador-2-TDS

---

## Atenção

**O projeto está dentro do OneDrive** (a Área de Trabalho é sincronizada). O OneDrive pode tentar sincronizar o `data/eventos.db` enquanto o servidor escreve nele, o que às vezes trava ou corrompe bancos SQLite. Se aparecer erro estranho de banco: pausar a sincronização do OneDrive enquanto trabalha, ou mover a pasta do projeto para fora do OneDrive (por exemplo, uma pasta `projetos` direto no disco C:). O código já está seguro no GitHub.

**Como abrir no celular (mesma rede Wi-Fi)**
1. No PC, `ipconfig` → anotar o "Endereço IPv4" (ex.: `192.168.0.15`).
2. No celular: `http://192.168.0.15:3333`.
3. Se não abrir, o Firewall do Windows está bloqueando o Node — permitir quando ele perguntar, ou liberar a porta 3333.

**Teste de ponta a ponta**
Existe um script (bash + curl) que confere as 60 verificações, mas ele ficou fora do projeto (depende do Git Bash). Tarefa aberta no TASKS.md: transformá-lo em `npm test` com o `node:test` que já vem no Node.

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
- Repositório conectado ao GitHub e primeiro push.
- **MVP inteiro implementado**: `validacoes.js`, 5 repositories, rotas `auth`/`admin`/`api`, middleware `carregarEvento`, 13 views, componentes CSS, `seed-demo.js`.
- Teste de ponta a ponta com o servidor real: 60/60. Prints no Edge headless em 360 px e 1280 px.
- Corrigidos depois dos prints: células da tabela quebrando (`.tabela .info` com `display: block`), botão de presença fora da tela no celular, botões "Excluir" chamativos demais, dados do evento empilhados no celular.
- Docs atualizados (ARCHITECTURE, RULES, DESIGN, TASKS, PRD, README, CLAUDE.md).
