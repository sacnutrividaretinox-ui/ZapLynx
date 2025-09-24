const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, "public")));

// Rotas de API (exemplo com Z-API, ajuste conforme seu código atual)
app.post("/api/send", async (req, res) => {
  try {
    const { phone, message } = req.body;

    // 🔑 Substitua pelas suas credenciais
    const ZAPI = {
      instanceId: process.env.ZAPI_INSTANCE_ID,
      token: process.env.ZAPI_TOKEN,
      clientToken: process.env.ZAPI_CLIENT_TOKEN
    };

    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/send-messages`;
    const response = await axios.post(
      url,
      { phone, message },
      { headers: { "client-token": ZAPI.clientToken } }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error.message);
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

// Forçar que "/" abra o index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Para qualquer rota que não seja API, devolve index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
