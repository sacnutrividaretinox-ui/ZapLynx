const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve frontend

// 🔑 Variáveis de ambiente (configure no Railway)
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID,
  token: process.env.ZAPI_TOKEN,
  clientToken: process.env.ZAPI_CLIENT_TOKEN
};

// =================== ROTAS =================== //

// 📌 Gerar QR Code (testa vários endpoints)
app.get("/api/qrcode", async (req, res) => {
  try {
    const baseUrl = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}`;

    const endpoints = ["/qr-code", "/qr-code/image", "/qr-code/base64"];
    let response = null;

    for (const endpoint of endpoints) {
      console.log(`🔎 Testando endpoint: ${endpoint}`);
      try {
        response = await axios.get(baseUrl + endpoint);

        if (response.data && (response.data.qrCode || response.data.image)) {
          console.log(`✅ QR Code encontrado em ${endpoint}`);
          return res.json({
            qr: response.data.qrCode || response.data.image
          });
        }
      } catch (e) {
        console.log(`⚠️ Falha em ${endpoint}`);
      }
    }

    throw new Error("Nenhum endpoint retornou QR válido da Z-API");
  } catch (error) {
    console.error("Erro ao buscar QR Code:", error.response?.data || error.message);
    res.status(500).json({
      error: "Falha ao gerar QR Code",
      details: error.response?.data || error.message
    });
  }
});

// 📌 Conectar número
app.post("/api/connect-number", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Número é obrigatório" });

    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/send-messages`;
    const response = await axios.post(url, {
      phone,
      message: "✅ Seu número foi conectado com sucesso!"
    });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Erro ao conectar número:", error.response?.data || error.message);
    res.status(500).json({
      error: "Falha ao conectar número",
      details: error.response?.data || error.message
    });
  }
});

// 📌 Enviar mensagem
app.post("/api/send", async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) {
      return res.status(400).json({ error: "Número e mensagem são obrigatórios" });
    }

    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/send-messages`;
    const response = await axios.post(url, { phone, message });

    res.json({ success: true, data: response.data });
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error.response?.data || error.message);
    res.status(500).json({
      error: "Falha ao enviar mensagem",
      details: error.response?.data || error.message
    });
  }
});

// =================== SERVIDOR =================== //
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
