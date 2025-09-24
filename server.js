const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // front no /public

// 🔑 Credenciais Z-API
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID || "SEU_INSTANCE_ID",
  token: process.env.ZAPI_TOKEN || "SEU_TOKEN",
};

// ✅ Gerar QR Code
app.get("/api/qr", async (req, res) => {
  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/qr-code/image`;
    const { data } = await axios.get(url);
    res.json({ qr: data.value }); // retorna base64
  } catch (error) {
    console.error("Erro ao buscar QR:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao buscar QR" });
  }
});

// ✅ Conectar pelo número
app.get("/api/connect-number/:phone", async (req, res) => {
  try {
    const { phone } = req.params;
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/phone-code/${phone}`;
    const { data } = await axios.get(url);
    res.json(data); // retorna código de verificação
  } catch (error) {
    console.error("Erro ao conectar pelo número:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao conectar pelo número" });
  }
});

// ✅ Enviar mensagem
app.post("/api/send", async (req, res) => {
  try {
    const { phone, message } = req.body;
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/send-text`;
    const { data } = await axios.post(url, { phone, message });
    res.json(data);
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
