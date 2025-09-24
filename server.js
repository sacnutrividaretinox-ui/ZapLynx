const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// 🔑 Credenciais Z-API (coloque as suas reais)
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID || "SUA_INSTANCIA",
  token: process.env.ZAPI_TOKEN || "SEU_TOKEN",
  clientToken: process.env.ZAPI_CLIENT_TOKEN || "SEU_CLIENT_TOKEN"
};

// =============================
// 📊 Estatísticas
// =============================
let stats = {
  total: 0,
  success: 0,
  fail: 0,
  pending: 0
};

// ✅ Enviar mensagem
app.post("/api/send", async (req, res) => {
  try {
    const { phone, message } = req.body;

    stats.total++;
    stats.pending++;

    const response = await axios.post(
      `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/send-text`,
      { phone, message },
      { headers: { "Client-Token": ZAPI.clientToken } }
    );

    stats.pending--;

    if (response.data?.messageId) {
      stats.success++;
      return res.json({ success: true, response: response.data });
    } else {
      stats.fail++;
      return res.status(400).json({ success: false, response: response.data });
    }
  } catch (err) {
    stats.pending--;
    stats.fail++;
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ✅ Pegar estatísticas
app.get("/api/stats", (req, res) => {
  res.json(stats);
});

// ✅ Rodar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
