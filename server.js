const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // frontend

// 🔑 Credenciais Z-API (configure no Railway como variáveis de ambiente)
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID,
  token: process.env.ZAPI_TOKEN,
  clientToken: process.env.ZAPI_CLIENT_TOKEN
};

// ✅ Rota para gerar QR Code
app.get("/api/qrcode", async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/qr-code/image`,
      { headers: { clientToken: ZAPI.clientToken } }
    );

    console.log("QR Code gerado!");
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao gerar QR:", error.response?.data || error.message);
    res.status(500).json({ error: "Falha ao gerar QR Code" });
  }
});

// ✅ Rota para conectar via Número (Pairing Code)
app.get("/api/connect-number/:phone", async (req, res) => {
  try {
    const phone = req.params.phone;

    // 1. Inicia o processo de pairing
    await axios.post(
      `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/pairing/start`,
      { phoneNumber: phone },
      { headers: { clientToken: ZAPI.clientToken } }
    );

    // 2. Pega o código de pareamento
    const response = await axios.get(
      `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/pairing/code`,
      { headers: { clientToken: ZAPI.clientToken } }
    );

    console.log("Pairing Code:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao conectar pelo número:", error.response?.data || error.message);
    res.status(500).json({ error: "Falha ao conectar pelo número" });
  }
});

// ✅ Rota para enviar mensagem
app.post("/api/send", async (req, res) => {
  try {
    const { phone, message } = req.body;

    const response = await axios.post(
      `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/send-text`,
      { phone, message },
      { headers: { clientToken: ZAPI.clientToken } }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error.response?.data || error.message);
    res.status(500).json({ error: "Falha ao enviar mensagem" });
  }
});

// 🚀 Inicializar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
