const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const Database = require("better-sqlite3");

console.log("🔄 Inicializando aplicação...");

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
// 🔹 Endpoint QR Code Z-API (corrigido)
// ============================
app.get("/api/qr", async (req, res) => {
  console.log("📡 Requisição recebida em /api/qr");

  try {
    const { ZAPI_INSTANCE_ID, ZAPI_TOKEN } = process.env;

    if (!ZAPI_INSTANCE_ID || !ZAPI_TOKEN) {
      console.error("❌ Variáveis da Z-API não configuradas");
      return res.status(500).json({ error: "Credenciais da Z-API ausentes" });
    }

    console.log("🔑 Tentando buscar QR da Z-API...");

    const response = await axios.get(
      `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/qr-code/image`,
      { responseType: "stream" }
    );

    res.setHeader("Content-Type", "image/png");
    response.data.pipe(res);

    console.log("✅ QR Code retornado com sucesso");
  } catch (err) {
    console.error("❌ Erro no endpoint /api/qr:", err.message);
    res.status(500).json({ error: "Erro ao gerar QR Code" });
  }
});

// ============================
// 🔹 Endpoint: Dashboard
// ============================
app.get("/api/dashboard", (req, res) => {
  try {
    const stats = {
      hoje: db.prepare("SELECT COUNT(*) as total FROM logs WHERE DATE(criado_em)=DATE('now')").get().total,
      ontem: db.prepare("SELECT COUNT(*) as total FROM logs WHERE DATE(criado_em)=DATE('now','-1 day')").get().total,
      seteDias: db.prepare("SELECT COUNT(*) as total FROM logs WHERE DATE(criado_em)>=DATE('now','-7 day')").get().total,
      trintaDias: db.prepare("SELECT COUNT(*) as total FROM logs WHERE DATE(criado_em)>=DATE('now','-30 day')").get().total,
      umAno: db.prepare("SELECT COUNT(*) as total FROM logs WHERE DATE(criado_em)>=DATE('now','-1 year')").get().total,
    };
    res.json(stats);
  } catch (err) {
    console.error("Erro no dashboard:", err);
    res.status(500).json({ error: "Erro ao gerar dashboard" });
  }
});

// ============================
// 🔹 Histórico
// ============================
app.get("/api/historico", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM logs ORDER BY campanha, criado_em DESC").all();
    const grouped = {};
    rows.forEach(log => {
      if (!grouped[log.campanha]) grouped[log.campanha] = [];
      grouped[log.campanha].push(log);
    });
    res.json(grouped);
  } catch (err) {
    console.error("Erro no histórico:", err);
    res.status(500).json({ error: "Erro ao carregar histórico" });
  }
});

// ============================
// 🔹 Gráfico por campanha
// ============================
app.get("/api/historico/:campanha", (req, res) => {
  try {
    const rows = db.prepare(
      "SELECT status, COUNT(*) as total FROM logs WHERE campanha = ? GROUP BY status"
    ).all(req.params.campanha);
    res.json(rows);
  } catch (err) {
    console.error("Erro gráfico da campanha:", err);
    res.status(500).json({ error: "Erro ao carregar gráfico da campanha" });
  }
});

// ============================
// 🔹 Inicialização do servidor
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
