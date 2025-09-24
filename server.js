const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // front-end

// 🔑 Variáveis Z-API (coloque no .env no Railway)
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID,
  token: process.env.ZAPI_TOKEN,
  clientToken: process.env.ZAPI_CLIENT_TOKEN
};

// ✅ Rota para pegar QR Code
app.get("/api/qrcode", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/qr-code/image`,
      { headers: { "client-token": ZAPI.clientToken } }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Erro QR:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao buscar QR Code" });
  }
});

// ✅ Rota para solicitar Pairing Code (Conectar via número)
app.post("/api/pairing", async (req, res) => {
  try {
    const { phone } = req.body;
    const response = await axios.post(
      `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/pairing/code`,
      { phone }, // manda o número para gerar o código
      { headers: { "client-token": ZAPI.clientToken } }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao solicitar Pairing Code:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao solicitar Pairing Code" });
  }
});

// ✅ Rota para enviar mensagens
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

// 🚀 Inicializar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
