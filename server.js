const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve index.html

// 🔑 Credenciais Z-API
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID || "SEU_INSTANCE_ID",
  token: process.env.ZAPI_TOKEN || "SEU_TOKEN",
  clientToken: process.env.ZAPI_CLIENT_TOKEN || "SEU_CLIENT_TOKEN"
};

// ✅ Rota para buscar QR Code
app.get("/api/qrcode", async (req, res) => {
  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/qr-code/image`;
    const response = await axios.get(url, {
      headers: {
        "Client-Token": ZAPI.clientToken
      }
    });
    res.json({ qr: response.data.value });
  } catch (error) {
    console.error("Erro ao buscar QR Code:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao gerar QR Code" });
  }
});

// ✅ Rota para checar Status da conexão
app.get("/api/status", async (req, res) => {
  try {
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/status`;
    const response = await axios.get(url, {
      headers: {
        "Client-Token": ZAPI.clientToken
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao checar Status:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao checar status" });
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
      {
        headers: {
          "Client-Token": ZAPI.clientToken
        }
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error.response?.data || error.message);
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

// ✅ Inicia servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
