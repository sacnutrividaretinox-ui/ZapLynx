const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve frontend

// 🔑 Variáveis de ambiente (configure no Railway)
const ZAPI_INSTANCE = process.env.ZAPI_INSTANCE_ID;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN;
const ZAPI_CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN;

// ✅ Rota: Gerar QR Code
app.get("/api/qrcode", async (req, res) => {
  try {
    const url = `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/qr-code/image`;
    const response = await axios.get(url, {
      headers: { "Client-Token": ZAPI_CLIENT_TOKEN }
    });
    res.json(response.data);
  } catch (err) {
    console.error("Erro ao gerar QR Code:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao gerar QR Code" });
  }
});

// ✅ Rota: Conectar número
app.post("/api/connect", async (req, res) => {
  const { numero } = req.body;
  if (!numero) return res.status(400).json({ error: "Número não informado" });

  try {
    const url = `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/phone/disconnect`;
    await axios.post(url, {}, { headers: { "Client-Token": ZAPI_CLIENT_TOKEN } });

    const statusUrl = `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/status`;
    const statusRes = await axios.get(statusUrl, {
      headers: { "Client-Token": ZAPI_CLIENT_TOKEN }
    });

    res.json({ success: true, data: statusRes.data });
  } catch (err) {
    console.error("Erro ao conectar número:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao conectar número" });
  }
});

// ✅ Rota: Checar Status
app.get("/api/status", async (req, res) => {
  try {
    const url = `https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/status`;
    const response = await axios.get(url, {
      headers: { "Client-Token": ZAPI_CLIENT_TOKEN }
    });
    res.json(response.data);
  } catch (err) {
    console.error("Erro ao checar status:", err.response?.data || err.message);
    res.status(500).json({ error: "Erro ao checar status" });
  }
});

// ✅ Inicializar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
