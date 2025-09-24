// ============================
// 📌 Dependências
// ============================
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// ============================
// 🔑 Credenciais da Z-API (Railway → Variables)
// ============================
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID || "SEU_INSTANCE_ID",
  token: process.env.ZAPI_TOKEN || "SEU_TOKEN",
  clientToken: process.env.ZAPI_CLIENT_TOKEN || "SEU_CLIENT_TOKEN",
  baseUrl() {
    return `https://api.z-api.io/instances/${this.instanceId}/token/${this.token}`;
  }
};

// ============================
// 🚀 Servir Front-End (pasta public)
// ============================
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ============================
// ✅ Rotas da API
// ============================

// Status
app.get("/api/status", (req, res) => {
  res.json({ status: "ok", message: "Micro SaaS rodando 🚀" });
});

// QR Code
app.get("/api/qr", async (req, res) => {
  try {
    const urls = [
      `${ZAPI.baseUrl()}/qr-code/image`,
      `${ZAPI.baseUrl()}/qr-code`
    ];

    let response;
    for (let url of urls) {
      try {
        response = await axios.get(url, {
          headers: { "Client-Token": ZAPI.clientToken },
          timeout: 10000
        });
        if (response.data) break;
      } catch (err) {
        continue;
      }
    }

    const data = response?.data;
    if (!data) return res.status(500).json({ error: "Nenhum QR retornado" });

    let qrCode = data.value || data.base64 || data.qrCode || data.url;
    if (!qrCode) {
      return res.status(500).json({ error: "Formato de QR desconhecido", raw: data });
    }

    // Se vier só base64, força formato de imagem
    if (!qrCode.startsWith("data:image") && !qrCode.startsWith("http")) {
      qrCode = `data:image/png;base64,${qrCode}`;
    }

    res.json({ qrCode });
  } catch (err) {
    res.status(500).json({ error: "Erro ao gerar QR", details: err.message });
  }
});

// Conectar pelo número
app.post("/api/connect-number", async (req, res) => {
  try {
    const { number } = req.body;
    if (!number) return res.status(400).json({ error: "Número é obrigatório" });

    const endpoints = [
      `${ZAPI.baseUrl()}/connect/phone`,
      `${ZAPI.baseUrl()}/start-session`
    ];

    let response;
    for (let url of endpoints) {
      try {
        response = await axios.post(url, { phone: number }, {
          headers: { "Client-Token": ZAPI.clientToken },
          timeout: 10000
        });
        if (response.data) break;
      } catch (err) {
        continue;
      }
    }

    if (!response) return res.status(500).json({ error: "Nenhum endpoint funcionou" });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao conectar pelo número", details: err.message });
  }
});

// ============================
// 🚀 Inicializar servidor
// ============================
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
