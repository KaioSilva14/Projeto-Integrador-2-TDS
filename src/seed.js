// Dados iniciais: categorias padrão + usuário organizador.
// Rodar com `npm run seed`. Pode rodar mais de uma vez sem duplicar nada.
// Com TURSO_DATABASE_URL no ambiente, roda no banco da nuvem (produção).
require('dotenv').config({ quiet: true });
const bcrypt = require('bcryptjs');
const db = require('./db');

async function main() {
  const categorias = ['Palestra', 'Feira', 'Reunião', 'Cultural', 'Esportivo', 'Competição'];
  for (const nome of categorias) {
    await db.executar('INSERT OR IGNORE INTO categorias (nome) VALUES (?)', [nome]);
  }
  console.log(`Categorias: ${categorias.length} garantidas.`);

  const { ADMIN_NOME, ADMIN_EMAIL, ADMIN_SENHA } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_SENHA) {
    throw new Error('Defina ADMIN_EMAIL e ADMIN_SENHA no arquivo .env antes de rodar o seed.');
  }

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existe = await db.obter('SELECT id FROM usuarios WHERE email = ?', [email]);
  if (existe) {
    console.log(`Organizador ${email} já existe — nada a fazer.`);
  } else {
    const senhaHash = await bcrypt.hash(ADMIN_SENHA, 10);
    await db.executar('INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
      [ADMIN_NOME || 'Organizador', email, senhaHash]);
    console.log(`Organizador ${email} criado.`);
  }
}

main()
  .catch((erro) => { console.error(erro.message); process.exitCode = 1; })
  .finally(() => db.fechar());
