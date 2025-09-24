// db.js
const Database = require("better-sqlite3");
const path = require("path");

// Caminho para o arquivo do banco
const dbPath = path.join(__dirname, "data.db");

// Conectar banco
const db = new Database(dbPath);

// Criar tabela se não existir
db.prepare(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

console.log("✅ SQLite pronto em:", dbPath);

module.exports = db;
