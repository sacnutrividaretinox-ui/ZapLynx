const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve arquivos do front

// 🔑 Variáveis da Z-API
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID,
  token: process.env.ZAPI_TOKEN,
  clientToken: process.env.ZAPI_CLIENT_TOKEN
};

// ✅ Rota QR Code
app.get("/api/qrcode", async (req, res) => {
  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/qr-code`;
    const response = await axios.get(url);
    res.json({ qr: response.data.qrCode });
  } catch (error) {
    console.error("Erro ao buscar QR Code:", error.message);
    res.status(500).json({ error: "Falha ao gerar QR Code" });
  }
});

// ✅ Rota Status
app.get("/api/status", async (req, res) => {
  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/status`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao checar Status:", error.message);
    res.status(500).json({ error: "Falha ao checar Status" });
  }
});

// ✅ Rota Enviar Mensagem
app.post("/api/send", async (req, res) => {
  try {
    const { phone, message } = req.body;
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/send-messages`;
    const response = await axios.post(url, {
      phone,
      message
    });
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error.message);
    res.status(500).json({ error: "Falha ao enviar mensagem" });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
