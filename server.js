const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // front

// 🔑 Credenciais Z-API (coloque no Railway como VARIÁVEIS DE AMBIENTE)
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID,
  token: process.env.ZAPI_TOKEN,
  clientToken: process.env.ZAPI_CLIENT_TOKEN,
};

// ✅ Rota para gerar QR Code
app.get("/api/qrcode", async (req, res) => {
  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/qr-code/image`;
    const response = await axios.get(url, {
      headers: { "client-token": ZAPI.clientToken },
    });
    res.json(response.data);
  } catch (error) {
    console.error("Erro QR:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// ✅ Rota para conectar pelo número (Pairing Code)
app.get("/api/connect-number/:phone", async (req, res) => {
  try {
    const phone = req.params.phone;
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/pairing/start`;

    const response = await axios.post(
      url,
      { phoneNumber: phone },
      { headers: { "client-token": ZAPI.clientToken } }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Erro ao conectar pelo número:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// ✅ Enviar mensagem
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
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// 🚀 Inicializar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
