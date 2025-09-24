const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // frontend fica na pasta /public

// 🔑 Configurações da Z-API (lembra de preencher com seus dados!)
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID || "SEU_INSTANCE_ID",
  token: process.env.ZAPI_TOKEN || "SEU_TOKEN",
  clientToken: process.env.ZAPI_CLIENT_TOKEN || "SEU_CLIENT_TOKEN"
};

// ✅ Rota: gerar QR Code
app.get("/api/qrcode", async (req, res) => {
  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/qr-code/image`;
    const { data } = await axios.get(url);
    res.json(data);
  } catch (err) {
    console.error("Erro QR:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// ✅ Rota: conectar via número (Pairing Code)
app.get("/api/connect-number/:phone", async (req, res) => {
  try {
    const phone = req.params.phone;
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/phone-disconnect/${phone}/pairing-code`;

    const { data } = await axios.get(url, {
      headers: { "client-token": ZAPI.clientToken }
    });

    res.json(data);
  } catch (err) {
    console.error("Erro ao conectar pelo número:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data || err.message });
  }
});

// 🚀 Inicializar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
