// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve index.html

// 🔑 Credenciais Z-API (substitua pelas suas reais)
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID || "SUA_INSTANCIA",
  token: process.env.ZAPI_TOKEN || "SEU_TOKEN",
  clientToken: process.env.ZAPI_CLIENT_TOKEN || "SEU_CLIENT_TOKEN",
};

// ✅ Rota principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ✅ Enviar mensagem
app.post("/send", async (req, res) => {
  try {
    const { phone, message } = req.body;
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/send-text`;

    const response = await axios.post(url, {
      phone,
      message,
    });

    res.json(response.data);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

// ✅ Conectar via QR Code
app.get("/qrcode", async (req, res) => {
  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/qrcode`;
    const response = await axios.get(url, {
      headers: { clientToken: ZAPI.clientToken },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao pegar QRCode:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao buscar QRCode" });
  }
});

// ✅ Conectar via número de telefone (Pairing Code)
app.get("/phone-code/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/phone-code/${phone}`;
    const response = await axios.get(url, {
      headers: { clientToken: ZAPI.clientToken },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao gerar Pairing Code:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao gerar Pairing Code" });
  }
});

// 🚀 Start do servidor (PORT do Railway ou 8080 local)
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
