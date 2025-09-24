const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const sqlite3 = require("sqlite3").verbose();

console.log("🔄 Inicializando aplicação...");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

console.log("✅ Middleware configurado");

// ============================
// 🔹 Banco de Dados SQLite
// ============================
const db = new sqlite3.Database(path.join(__dirname, "data.db"), (err) => {
  if (err) {
    console.error("❌ Erro ao abrir banco:", err.message);
  } else {
    console.log("✅ Banco de dados SQLite iniciado");
    db.run(`
      CREATE TABLE IF NOT EXISTS logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        campanha TEXT,
        mensagem TEXT,
        status TEXT,
        criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Tabela logs verificada/criada");
  }
});

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
// 🔹 Endpoint Dashboard
// ============================
app.get("/api/dashboard", (req, res) => {
  const queries = {
    hoje: `SELECT COUNT(*) as total FROM logs WHERE DATE(criado_em)=DATE('now')`,
    ontem: `SELECT COUNT(*) as total FROM logs WHERE DATE(criado_em)=DATE('now','-1 day')`,
    seteDias: `SELECT COUNT(*) as total FROM logs WHERE DATE(criado_em)>=DATE('now','-7 day')`,
    trintaDias: `SELECT COUNT(*) as total FROM logs WHERE DATE(criado_em)>=DATE('now','-30 day')`,
    umAno: `SELECT COUNT(*) as total FROM logs WHERE DATE(criado_em)>=DATE('now','-1 year')`
  };

  const stats = {};
  let done = 0;

  Object.keys(queries).forEach((key) => {
    db.get(queries[key], [], (err, row) => {
      if (err) {
        console.error(`Erro no dashboard (${key}):`, err.message);
        stats[key] = 0;
      } else {
        stats[key] = row.total;
      }
      done++;
      if (done === Object.keys(queries).length) {
        res.json(stats);
      }
    });
  });
});

// ============================
// 🔹 Endpoint Histórico
// ============================
app.get("/api/historico", (req, res) => {
  db.all("SELECT * FROM logs ORDER BY campanha, criado_em DESC", [], (err, rows) => {
    if (err) {
      console.error("Erro no histórico:", err.message);
      return res.status(500).json({ error: "Erro ao carregar histórico" });
    }
    const grouped = {};
    rows.forEach(log => {
      if (!grouped[log.campanha]) grouped[log.campanha] = [];
      grouped[log.campanha].push(log);
    });
    res.json(grouped);
  });
});

// ============================
// 🔹 Endpoint Gráfico por campanha
// ============================
app.get("/api/historico/:campanha", (req, res) => {
  db.all(
    "SELECT status, COUNT(*) as total FROM logs WHERE campanha = ? GROUP BY status",
    [req.params.campanha],
    (err, rows) => {
      if (err) {
        console.error("Erro gráfico da campanha:", err.message);
        return res.status(500).json({ error: "Erro ao carregar gráfico da campanha" });
      }
      res.json(rows);
    }
  );
});

// ============================
// 🔹 Inicialização
// ============================
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
