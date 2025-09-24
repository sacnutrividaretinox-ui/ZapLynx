const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve index.html, conexao.html, style.css

// 🔑 CREDENCIAIS Z-API
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID,
  token: process.env.ZAPI_TOKEN,
  clientToken: process.env.ZAPI_CLIENT_TOKEN
};

// ✅ ROTA PARA PEGAR QR CODE
app.get("/api/qrcode", async (req, res) => {
  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/qr-code/image`;
    const response = await axios.get(url, {
      headers: { clientToken: ZAPI.clientToken }
    });

    if (response.data && response.data.value) {
      return res.json({ qr: response.data.value }); // retorna base64 do QR
    } else {
      return res.json({ qr: null });
    }
  } catch (err) {
    console.error("Erro ao buscar QR:", err.message);
    res.status(500).json({ qr: null, error: err.message });
  }
});

// 🔥 PORT
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
