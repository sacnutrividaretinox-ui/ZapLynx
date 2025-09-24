const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve index.html

// 🔑 Variáveis da Z-API
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID || "SUA_INSTANCE_ID",
  token: process.env.ZAPI_TOKEN || "SEU_TOKEN",
  clientToken: process.env.ZAPI_CLIENT_TOKEN || "SEU_CLIENT_TOKEN",
};

// ✅ Rota para pegar QR Code
app.get("/api/qrcode", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/qr-code/image`,
      { headers: { "client-token": ZAPI.clientToken } }
    );
    res.json({ qrCode: response.data.value });
  } catch (error) {
    console.error("Erro QR:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao gerar QR Code" });
  }
});

// ✅ Rota para solicitar Pairing Code (conectar com número)
app.post("/api/pairing", async (req, res) => {
  try {
    const { phone } = req.body;
    const response = await axios.post(
      `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/pairing/start`,
      { phone }, // número que vai receber o código
      { headers: { "client-token": ZAPI.clientToken } }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao solicitar Pairing Code:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao solicitar Pairing Code" });
  }
});

// ✅ Rota para enviar mensagem
app.post("/api/send", async (req, res) => {
  try {
    const { phone, message } = req.body;
    const response = await axios.post(
      `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/send-text`,
      { phone, message },
      { headers: { "client-token": ZAPI.clientToken } }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
