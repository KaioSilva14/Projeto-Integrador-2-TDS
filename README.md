# Sistema de Eventos Escolares

Plataforma web onde a escola publica eventos com vagas limitadas, os alunos se inscrevem sem precisar de login e a coordenação controla os inscritos e a presença no dia.

Projeto Integrador do **2º TDS** — Colégio Estadual José Luiz Gori, Mandaguari/PR.
Disciplinas: Banco de Dados II, Back-End, Inovação Tecnológica e Empreendedorismo · Prof. Anilton Bittencourt · Grupo 7.

**Stack:** Node.js · Express 4 · EJS · SQLite (`better-sqlite3`) · `express-session` + `bcryptjs` · CSS puro.

---

## Como rodar

**Pré-requisitos:** Node.js LTS e Git.

```bash
git clone <url-do-repositorio>
cd <pasta-do-repositorio>
npm install
cp .env.example .env   # abrir o .env e preencher SESSION_SECRET e ADMIN_SENHA
npm run seed           # cria o banco, as categorias padrão e o organizador
npm run dev            # http://localhost:3333
```

Para gerar o `SESSION_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Login do organizador:** `/admin/login` com o `ADMIN_EMAIL` e a `ADMIN_SENHA` do seu `.env`.

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia com reinício automático ao salvar |
| `npm start` | Inicia sem reinício automático |
| `npm run seed` | Cria categorias e organizador (pode rodar várias vezes) |

**Recomeçar o banco do zero** (apaga tudo; pare o servidor antes):
```bash
rm data/eventos.db
npm run seed
```

---

## Documentação

| | |
|---|---|
| [docs/PRD.md](docs/PRD.md) | Problema, público, histórias de usuário e critérios de aceite |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Camadas, DER, mapa de rotas, decisões técnicas |
| [docs/RULES.md](docs/RULES.md) | Regras de negócio, validações, segurança, convenções |
| [docs/DESIGN.md](docs/DESIGN.md) | Identidade visual, tokens e componentes |
| [docs/TASKS.md](docs/TASKS.md) | Andamento do projeto por semana |
| [docs/MEMORY.md](docs/MEMORY.md) | Decisões, problemas resolvidos e diário |
| [src/schema.sql](src/schema.sql) | Script de criação do banco |
