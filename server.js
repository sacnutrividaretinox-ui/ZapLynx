const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve front

// 🔑 Variáveis de ambiente
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID,
  token: process.env.ZAPI_TOKEN,
  clientToken: process.env.ZAPI_CLIENT_TOKEN,
};

// ✅ Rota para gerar QR Code
app.get("/api/qrcode", async (req, res) => {
  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/qr-code/image`;
    const response = await axios.get(url, { responseType: "arraybuffer" });

    const base64 = Buffer.from(response.data, "binary").toString("base64");
    res.json({ qr: `data:image/png;base64,${base64}` });
  } catch (err) {
    console.error("Erro ao gerar QR:", err.response?.data || err.message);
    res.status(500).json({ error: "Falha ao gerar QR Code" });
  }
});

// ✅ Rota para conectar com número (Pairing Code)
app.post("/api/connect-number", async (req, res) => {
  const { phone } = req.body;
  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/phone-connect/${phone}`;
    const response = await axios.get(url);

    res.json(response.data);
  } catch (err) {
    console.error("Erro ao conectar com número:", err.response?.data || err.message);
    res.status(500).json({ error: "Falha ao conectar pelo número" });
  }
});

// ✅ Rota para enviar mensagem
app.post("/api/send", async (req, res) => {
  const { phone, message } = req.body;
  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/send-text`;
    const response = await axios.post(url, { phone, message });
    res.json(response.data);
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err.response?.data || err.message);
    res.status(500).json({ error: "Falha ao enviar mensagem" });
  }
});

// 🚀 Inicializar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
