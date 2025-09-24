// db.js
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

// Caminho do arquivo do banco
const dbPath = path.join(__dirname, "data.db");

// Criar ou conectar banco
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Erro ao conectar no SQLite:", err.message);
  } else {
    console.log("✅ Conectado ao SQLite:", dbPath);
  }
});

// Criar tabela de mensagens se não existir
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
