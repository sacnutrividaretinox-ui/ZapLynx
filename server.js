const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve arquivos da pasta public

// 🔑 Variáveis do Railway (.env)
const { ZAPI_INSTANCE_ID, ZAPI_TOKEN, ZAPI_CLIENT_TOKEN, ZAPI_MODE } = process.env;

// Função para montar a URL correta da API Z-API
function getZapiUrl(type) {
  if (ZAPI_MODE === "cloud") {
    // Novo modelo Cloud
    if (type === "qr") return `https://api.z-api.io/instances/qr-code/${ZAPI_INSTANCE_ID}/${ZAPI_TOKEN}`;
    if (type === "status") return `https://api.z-api.io/instances/status/${ZAPI_INSTANCE_ID}/${ZAPI_TOKEN}`;
  } else {
    // Modelo padrão/antigo
    if (type === "qr") return `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/qr-code`;
    if (type === "status") return `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/status`;
  }
  return null;
}

// Config padrão do axios para enviar client-token
function getAxiosConfig() {
  return {
    headers: {
      "client-token": ZAPI_CLIENT_TOKEN || "",
    },
  };
}

// ✅ Rota para gerar QR Code
app.get("/api/generate-qr", async (req, res) => {
  try {
    const url = getZapiUrl("qr");
    if (!url) throw new Error("URL de QR Code não encontrada (verifique ZAPI_MODE)");

    const response = await axios.get(url, getAxiosConfig());
    console.log("Resposta QR:", response.data);

    // Pode vir como base64 ou link
    let qrCode = response.data.qrCode || response.data.qr || response.data.image;
    if (qrCode && !qrCode.startsWith("data:image")) {
      qrCode = `data:image/png;base64,${qrCode}`;
    }

    if (!qrCode) {
      return res.json({ error: "Nenhum QR retornado pela Z-API", raw: response.data });
    }

    res.json({ qrCode });
  } catch (err) {
    console.error("Erro ao gerar QR Code:", err.response?.data || err.message);
    res.status(500).json({
      error: err.message,
      details: err.response?.data || "Erro desconhecido",
    });
  }
});

// ✅ Rota para checar status da instância
app.get("/api/status", async (req, res) => {
  try {
    const url = getZapiUrl("status");
    if (!url) throw new Error("URL de Status não encontrada (verifique ZAPI_MODE)");

    const response = await axios.get(url, getAxiosConfig());
    console.log("Resposta Status:", response.data);

    res.json(response.data);
  } catch (err) {
    console.error("Erro ao checar Status:", err.response?.data || err.message);
    res.status(500).json({
      error: err.message,
      details: err.response?.data || "Erro desconhecido",
    });
  }
});

// 🚀 Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
