const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const db = require("./db"); // SQLite

const app = express();
app.use(cors());
app.use(express.json());

const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID || "SEU_INSTANCE_ID",
  token: process.env.ZAPI_TOKEN || "SEU_TOKEN",
  clientToken: process.env.ZAPI_CLIENT_TOKEN || "SEU_CLIENT_TOKEN",
  baseUrl() {
    return `https://api.z-api.io/instances/${this.instanceId}/token/${this.token}`;
  }
};

// Servir front
app.use(express.static(path.join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Status
app.get("/api/status", (req, res) => {
  res.json({ status: "ok", message: "Micro SaaS rodando 🚀" });
});

// QR Code
app.get("/api/qr", async (req, res) => {
  try {
    const response = await axios.get(`${ZAPI.baseUrl()}/qr-code/image`, {
      headers: { "Client-Token": ZAPI.clientToken }
    });

    if (response.data?.value) {
      let qrCode = response.data.value;
      if (!qrCode.startsWith("data:image")) {
        qrCode = `data:image/png;base64,${qrCode}`;
      }
      res.json({ qrCode });
    } else if (response.data?.url) {
      res.json({ qrCode: response.data.url });
    } else {
      res.status(500).json({ error: "QR Code não retornado", raw: response.data });
    }
  } catch (err) {
    res.status(500).json({ error: "Erro ao gerar QR Code", details: err.message });
  }
});

// Conectar pelo número
app.post("/api/connect-number", async (req, res) => {
  try {
    const { number } = req.body;
    if (!number) return res.status(400).json({ error: "Número é obrigatório" });

    const response = await axios.post(
      `${ZAPI.baseUrl()}/connect/phone`, // ajuste se sua versão usar outro endpoint
      { phone: number },
      { headers: { "Client-Token": ZAPI.clientToken } }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao conectar pelo número", details: err.message });
  }
});

// Enviar mensagem
app.post("/api/send-message", async (req, res) => {
  try {
    const { phone, message } = req.body;

    db.prepare("INSERT INTO messages (phone, message, status) VALUES (?, ?, ?)").run(phone, message, "pending");

    const response = await axios.post(
      `${ZAPI.baseUrl()}/send-text`,
      { phone, message },
      { headers: { "Client-Token": ZAPI.clientToken } }
    );

    db.prepare("UPDATE messages SET status = ? WHERE phone = ? AND message = ?").run("sent", phone, message);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message, details: err.response?.data || null });
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

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
