const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");

console.log("🔄 Inicializando aplicação...");

let Database;
try {
  Database = require("better-sqlite3");
  console.log("✅ Módulo better-sqlite3 carregado com sucesso");
} catch (err) {
  console.error("❌ Erro ao carregar better-sqlite3:", err.message);
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

console.log("✅ Middleware configurado");

// ============================
// 🔹 Banco de Dados
// ============================
let db;
try {
  db = new Database(path.join(__dirname, "data.db"));
  console.log("✅ Banco de dados SQLite iniciado");
  db.prepare(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campanha TEXT,
      mensagem TEXT,
      status TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();
  console.log("✅ Tabela logs verificada/criada");
} catch (err) {
  console.error("❌ Erro ao iniciar banco de dados:", err.message);
}

// ============================
// 🔹 Endpoint de teste
// ============================
app.get("/ping", (req, res) => {
  console.log("📡 Requisição recebida em /ping");
  res.json({ pong: true });
});

// ============================
// 🔹 Endpoint QR Code Z-API
// ============================
app.get("/api/qr", async (req, res) => {
  console.log("📡 Requisição recebida em /api/qr");

  try {
    const { ZAPI_INSTANCE_ID, ZAPI_TOKEN } = process.env;

    if (!ZAPI_INSTANCE_ID || !ZAPI_TOKEN) {
      console.error("❌ Variáveis da Z-API não configuradas");
      return res.status(500).json({ error: "Credenciais da Z-API ausentes" });
    }

    console.log("🔑 Usando credenciais:", {
      ZAPI_INSTANCE_ID,
      ZAPI_TOKEN: ZAPI_TOKEN.substring(0, 5) + "...",
    });

    const response = await axios.get(
      `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/qr-code/image`,
      { responseType: "arraybuffer" }
    );

    res.setHeader("Content-Type", "image/png");
    res.send(response.data);
    console.log("✅ QR Code retornado com sucesso");
  } catch (err) {
    console.error("❌ Erro no endpoint /api/qr:", err.message);
    res.status(500).json({ error: "Erro ao gerar QR Code" });
  }
});

// ============================
// 🔹 Inicialização do servidor
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
