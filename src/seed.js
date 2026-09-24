// Dados iniciais: categorias padrão + usuário organizador.
// Rodar com `npm run seed`. Pode rodar mais de uma vez sem duplicar nada.
require('dotenv').config({ quiet: true });
const bcrypt = require('bcryptjs');
const db = require('./db');

const categorias = ['Palestra', 'Feira', 'Reunião', 'Cultural', 'Esportivo', 'Competição'];
const inserirCategoria = db.prepare('INSERT OR IGNORE INTO categorias (nome) VALUES (?)');
for (const nome of categorias) {
  inserirCategoria.run(nome);
}
console.log(`Categorias: ${categorias.length} garantidas.`);

const { ADMIN_NOME, ADMIN_EMAIL, ADMIN_SENHA } = process.env;
if (!ADMIN_EMAIL || !ADMIN_SENHA) {
  console.error('Defina ADMIN_EMAIL e ADMIN_SENHA no arquivo .env antes de rodar o seed.');
  process.exit(1);
}

const email = ADMIN_EMAIL.trim().toLowerCase();
const existe = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
if (existe) {
  console.log(`Organizador ${email} já existe — nada a fazer.`);
} else {
  const senhaHash = bcrypt.hashSync(ADMIN_SENHA, 10);
  db.prepare('INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)')
    .run(ADMIN_NOME || 'Organizador', email, senhaHash);
  console.log(`Organizador ${email} criado.`);
}
