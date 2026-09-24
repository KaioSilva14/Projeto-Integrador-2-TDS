-- Schema do Sistema de Eventos Escolares (ver CLAUDE.md, seção 5.3).
-- Executado pelo db.js a cada inicialização: por isso IF NOT EXISTS e nenhum INSERT aqui.

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

-- Mensagens da página de contato (lidas só pelo organizador).
CREATE TABLE IF NOT EXISTS mensagens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  assunto TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida INTEGER NOT NULL DEFAULT 0 CHECK (lida IN (0,1)),
  criado_em TEXT DEFAULT CURRENT_TIMESTAMP
);
