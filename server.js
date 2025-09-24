const express = require("express");
const cors = require("cors");
const path = require("path");
const axios = require("axios");
const Database = require("better-sqlite3");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===== Banco de Dados (Better-SQLite3) =====
const db = new Database(path.join(__dirname, "data.db"));

db.prepare(`
  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    campanha TEXT,
    mensagem TEXT,
    status TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// ===== Endpoint: enviar mensagem (exemplo mock) =====
app.post("/send", (req, res) => {
  const { message, campanha } = req.body;

  try {
    db.prepare("INSERT INTO logs (campanha, mensagem, status) VALUES (?, ?, ?)")
      .run(campanha || "sem-campanha", message, "enviado");

    res.json({ ok: true });
  } catch (err) {
    console.error("Erro ao salvar log:", err);
    res.status(500).json({ error: "Erro ao salvar log" });
  }
});

// ===== Endpoint: QR Code da Z-API =====
app.get("/api/qr", async (req, res) => {
  try {
    const { ZAPI_INSTANCE_ID, ZAPI_TOKEN } = process.env;

    if (!ZAPI_INSTANCE_ID || !ZAPI_TOKEN) {
      return res.status(500).json({ error: "Credenciais da Z-API não configuradas" });
    }

    const response = await axios.get(
      `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/qr-code/image`,
      { responseType: "arraybuffer" }
    );

    res.setHeader("Content-Type", "image/png");
    res.send(response.data);
  } catch (err) {
    console.error("Erro ao buscar QR:", err.message);
    res.status(500).json({ error: "Não foi possível gerar QR Code" });
  }
});

// ===== Endpoint: Dashboard =====
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
    res.status(500).json({ error: "Erro ao gerar dashboard" });
  }
});

// ===== Endpoint: campanhas =====
app.get("/api/campanhas", (req, res) => {
  try {
    const rows = db.prepare("SELECT DISTINCT campanha FROM logs ORDER BY campanha").all();
    res.json(rows.map(r => r.campanha));
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar campanhas" });
  }
});

// ===== Endpoint: histórico agrupado =====
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
    res.status(500).json({ error: "Erro ao carregar histórico" });
  }
});

// ===== Endpoint: gráfico por campanha =====
app.get("/api/historico/:campanha", (req, res) => {
  try {
    const rows = db.prepare(
      "SELECT status, COUNT(*) as total FROM logs WHERE campanha = ? GROUP BY status"
    ).all(req.params.campanha);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar gráfico da campanha" });
  }
});

// ===== Inicialização =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
