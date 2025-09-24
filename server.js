// ============================
// 📌 Dependências
// ============================
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const db = require("./db"); // SQLite (better-sqlite3)

const app = express();
app.use(cors());
app.use(express.json());

// ============================
// 🔑 Credenciais da Z-API
// ============================
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID || "SEU_INSTANCE_ID",
  token: process.env.ZAPI_TOKEN || "SEU_TOKEN",
  clientToken: process.env.ZAPI_CLIENT_TOKEN || "SEU_CLIENT_TOKEN",
  baseUrl() {
    return `https://api.z-api.io/instances/${this.instanceId}/token/${this.token}`;
  }
};

// ============================
// 🚀 Servir Front-End
// ============================
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ============================
// ✅ Rotas
// ============================

// Status
app.get("/api/status", (req, res) => {
  res.json({ status: "ok", message: "Micro SaaS rodando 🚀" });
});

// QR Code
app.get("/api/qr", async (req, res) => {
  try {
    const response = await axios.get(`${ZAPI.baseUrl()}/qr-code/image`, {
      headers: { "Client-Token": ZAPI.clientToken },
      timeout: 10000
    });

    if (response.data?.value) {
      // 🚀 retorna base64 com prefixo pronto
      res.json({ qrCode: `data:image/png;base64,${response.data.value}` });
    } else if (response.data?.url) {
      // 🚀 algumas versões da Z-API retornam link pronto
      res.json({ qrCode: response.data.url });
    } else {
      res.status(500).json({
        error: "QR Code não retornado pela Z-API",
        raw: response.data
      });
    }
  } catch (err) {
    console.error("❌ Erro na rota /api/qr:", err.response?.data || err.message);
    res.status(500).json({
      error: "Erro ao gerar QR Code",
      details: err.response?.data || err.message
    });
  }
});

// Enviar mensagem + salvar no banco
app.post("/api/send-message", async (req, res) => {
  try {
    const { phone, message } = req.body;

    db.prepare(
      "INSERT INTO messages (phone, message, status) VALUES (?, ?, ?)"
    ).run(phone, message, "pending");

    const response = await axios.post(
      `${ZAPI.baseUrl()}/send-text`,
      { phone, message },
      { headers: { "Client-Token": ZAPI.clientToken } }
    );

    db.prepare(
      "UPDATE messages SET status = ? WHERE phone = ? AND message = ?"
    ).run("sent", phone, message);

    res.json(response.data);
  } catch (err) {
    console.error("❌ Erro no envio:", err.response?.data || err.message);
    res.status(500).json({
      error: err.message,
      details: err.response?.data || null
    });
  }
});

// Histórico
app.get("/api/messages", (req, res) => {
  try {
    const rows = db.prepare("SELECT * FROM messages ORDER BY created_at DESC").all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================
// 🚀 Inicializar servidor
// ============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
