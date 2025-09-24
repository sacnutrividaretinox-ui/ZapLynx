const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // front-end

// 🔑 Variáveis da Z-API (configure no Railway)
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID,
  token: process.env.ZAPI_TOKEN,
  clientToken: process.env.ZAPI_CLIENT_TOKEN
};

// ✅ Rota para pegar QR Code
app.get("/api/qrcode", async (req, res) => {
  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/qr-code/image`;
    const response = await axios.get(url, {
      headers: { "client-token": ZAPI.clientToken }
    });
    res.json(response.data);
  } catch (error) {
    console.error("Erro QR:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao buscar QR Code" });
  }
});

// ✅ Rota para conectar com número (Phone Code)
app.get("/api/phone-code/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/phone-code/${phone}`;

    const response = await axios.get(url, {
      headers: { "client-token": ZAPI.clientToken }
    });

    console.log("Resposta Phone Code:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao gerar Phone Code:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao gerar Phone Code" });
  }
});

// ✅ Rota para enviar mensagem
app.post("/api/send", async (req, res) => {
  try {
    const { phone, message } = req.body;
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/send-text`;

    const response = await axios.post(
      url,
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
