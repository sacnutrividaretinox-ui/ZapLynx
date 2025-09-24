// ============================
// 📌 Dependências
// ============================
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ============================
// 🔑 Credenciais da Z-API (Railway → Variables)
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
// 🚀 Servir Front-End (pasta public)
// ============================
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ============================
// ✅ Rotas da API
// ============================

// Status
app.get("/api/status", (req, res) => {
  res.json({ status: "ok", message: "Micro SaaS rodando 🚀" });
});

// QR Code
app.get("/api/qrcode", async (req, res) => {
  try {
    const response = await axios.get(`${ZAPI.baseUrl()}/qrcode`, {
      headers: { "client-token": ZAPI.clientToken }
    });
    res.json(response.data);
  } catch (err) {
    console.error("❌ Erro ao buscar QRCode:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao buscar QRCode" });
  }
});

// Conectar com número (Phone Code)
app.get("/api/phone-code/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    const url = `${ZAPI.baseUrl()}/phone-code/${phone}`;
    const response = await axios.get(url, {
      headers: { "client-token": ZAPI.clientToken }
    });
    res.json(response.data);
  } catch (err) {
    console.error("❌ Erro ao buscar Phone Code:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao buscar Phone Code" });
  }
});

// Enviar mensagem
app.post("/api/send", async (req, res) => {
  try {
    const { phone, message } = req.body;
    const url = `${ZAPI.baseUrl()}/send-text`;

    const response = await axios.post(
      url,
      { phone, message },
      { headers: { "client-token": ZAPI.clientToken } }
    );

    res.json(response.data);
  } catch (err) {
    console.error("❌ Erro ao enviar mensagem:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

// ============================
// 🚀 Inicializar servidor
// ============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
