const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve index.html

// 🔑 Credenciais Z-API (coloque as suas no Railway → Variables)
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID,
  token: process.env.ZAPI_TOKEN,
  clientToken: process.env.ZAPI_CLIENT_TOKEN,
};

// ✅ Rota: Gerar QR Code
app.get("/api/qrcode", async (req, res) => {
  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/qr-code/image`;
    const response = await axios.get(url);
    res.json({ qr: response.data.value || null });
  } catch (err) {
    console.error("Erro QR:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao gerar QR Code" });
  }
});

// ✅ Rota: Conectar pelo número (Pairing Code)
app.post("/api/connect-number", async (req, res) => {
  const { phone } = req.body;
  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/pairing-code`;
    const response = await axios.post(url, { phone });
    res.json(response.data);
  } catch (err) {
    console.error("Erro conectar número:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao conectar pelo número" });
  }
});

// ✅ Rota: Enviar mensagem
app.post("/api/send", async (req, res) => {
  const { phone, message } = req.body;
  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/send-text`;
    const response = await axios.post(url, { phone, message });
    res.json(response.data);
  } catch (err) {
    console.error("Erro envio:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

// 🚀 Inicializar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
