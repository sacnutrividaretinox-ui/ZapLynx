const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve index.html

// 🔑 Credenciais Z-API (⚠️ mova para .env em produção)
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID || "SUA_INSTANCE",
  token: process.env.ZAPI_TOKEN || "SEU_TOKEN",
  clientToken: process.env.ZAPI_CLIENT_TOKEN || "SEU_CLIENT_TOKEN"
};

// ✅ Rota para gerar QR Code
app.get("/api/qrcode", async (req, res) => {
  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/qr-code/image`;
    const response = await axios.get(url, {
      headers: { "client-token": ZAPI.clientToken }
    });

    console.log("Resposta QR:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Erro QR:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao gerar QR Code" });
  }
});

// ✅ Nova rota para gerar Pairing Code (conectar via número)
app.get("/api/pair/:phone", async (req, res) => {
  try {
    const { phone } = req.params;

    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/phone-pairing-code/${phone}`;
    const response = await axios.get(url, {
      headers: { "client-token": ZAPI.clientToken }
    });

    console.log("Resposta Pairing Code:", response.data);
    res.json(response.data);
  } catch (error) {
    console.error("Erro Pairing Code:", error.response?.data || error.message);
    res.status(500).json({ error: "Falha ao gerar Pairing Code" });
  }
});

// 🚀 Inicializar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
