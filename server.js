const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // frontend na pasta public

// 🔑 Credenciais Z-API (vem do Railway)
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID,
  token: process.env.ZAPI_TOKEN,
  clientToken: process.env.ZAPI_CLIENT_TOKEN,
  baseUrl() {
    return `https://api.z-api.io/instances/${this.instanceId}/token/${this.token}`;
  }
};

// ✅ Gerar QR Code
app.get("/api/qrcode", async (req, res) => {
  try {
    const response = await axios.get(`${ZAPI.baseUrl()}/qrcode`, {
      headers: { "client-token": ZAPI.clientToken }
    });
    res.json(response.data);
  } catch (err) {
    console.error("❌ Erro ao buscar QRCode:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao buscar QRCode" });
  }
});

// ✅ Enviar mensagem
app.post("/api/send", async (req, res) => {
  try {
    const { phone, message } = req.body;
    const response = await axios.post(
      `${ZAPI.baseUrl()}/send-text`,
      { phone, message },
      { headers: { "client-token": ZAPI.clientToken } }
    );
    res.json(response.data);
  } catch (err) {
    console.error("❌ Erro ao enviar mensagem:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

// 🚀 Start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
