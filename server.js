const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve HTML

// 🔑 Credenciais (Railway → Variables)
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID,
  token: process.env.ZAPI_TOKEN,
  clientToken: process.env.ZAPI_CLIENT_TOKEN
};

// =================== ROTAS =================== //

// 📌 Gerar QR Code (com fallback automático)
app.get("/api/qrcode", async (req, res) => {
  try {
    const baseUrl = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}`;
    
    // Tenta primeiro o endpoint padrão
    let response = await axios.get(`${baseUrl}/qr-code`).catch(() => null);

    // Se não deu, tenta endpoint alternativo
    if (!response || !response.data.qrCode) {
      console.log("⚠️ Tentando fallback em /qr-code/image...");
      response = await axios.get(`${baseUrl}/qr-code/image`).catch(() => null);
    }

    // Se ainda não achou, retorna erro
    if (!response || !response.data) {
      throw new Error("Nenhum QR retornado pela Z-API");
    }

    res.json({ qr: response.data.qrCode || response.data.image || null });
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
