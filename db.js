const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Banco salvo como arquivo local
const db = new sqlite3.Database(path.join(__dirname, "data.db"));

// Criar tabela se não existir
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campanha TEXT,
      mensagem TEXT,
      status TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
