const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve index.html, style.css, app.js

// 🔑 Credenciais Z-API
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID,
  token: process.env.ZAPI_TOKEN,
  clientToken: process.env.ZAPI_CLIENT_TOKEN
};

// ✅ Rota para QR Code
app.get("/api/qrcode", async (req, res) => {
  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/qr-code/image`;
    const response = await axios.get(url, {
      headers: { "Client-Token": ZAPI.clientToken },
      responseType: "arraybuffer"
    });

    const base64 = Buffer.from(response.data, "binary").toString("base64");
    res.json({ qr: `data:image/png;base64,${base64}` });
  } catch (err) {
    console.error("Erro ao buscar QR:", err.response?.data || err.message);
    res.status(500).json({ qr: null, error: err.message });
  }
});

// ✅ Rota para Status
app.get("/api/status", async (req, res) => {
  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/status`;
    const response = await axios.get(url, {
      headers: { "Client-Token": ZAPI.clientToken }
    });

    res.json(response.data);
  } catch (err) {
    console.error("Erro ao checar Status:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao checar status" });
  }
});

// ✅ Rota para Enviar Mensagem
app.post("/api/send", async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ error: "Número e mensagem são obrigatórios" });
    }

    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/send-text`;
    const response = await axios.post(
      url,
      { phone, message },
      { headers: { "Client-Token": ZAPI.clientToken } }
    );

    res.json(response.data);
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

// 🚀 Start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
