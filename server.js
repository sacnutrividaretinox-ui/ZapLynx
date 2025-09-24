const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Arquivo onde os logs serão salvos
const LOG_FILE = path.join(__dirname, "logs.json");

// Carregar logs existentes do arquivo
let messageLogs = [];
if (fs.existsSync(LOG_FILE)) {
  try {
    messageLogs = JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));
  } catch (e) {
    console.error("Erro ao ler logs.json:", e);
  }
}

// Função para salvar no arquivo
function salvarLog(log) {
  messageLogs.push(log);
  fs.writeFileSync(LOG_FILE, JSON.stringify(messageLogs, null, 2));
}

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Enviar mensagem
app.post("/api/send", async (req, res) => {
  try {
    const { phone, message } = req.body;

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

    // Salvar log
    salvarLog({
      phone,
      message,
      date: new Date().toISOString()
    });

    res.json(response.data);
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error.message);
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

// Estatísticas para o gráfico
app.get("/api/stats", (req, res) => {
  const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  let data = [0, 0, 0, 0, 0, 0, 0];

  messageLogs.forEach(log => {
    const day = new Date(log.date).getDay(); // 0 = Dom, 6 = Sáb
    data[day] += 1;
  });

  res.json({ labels, data });
});

// Histórico para a página Início
app.get("/api/history", (req, res) => {
  res.json(messageLogs.slice(-20).reverse()); // últimos 20 registros
});

// Exportar CSV
app.get("/api/export/csv", (req, res) => {
  if (messageLogs.length === 0) {
    return res.status(404).send("Nenhum log disponível");
  }

  let csv = "Telefone,Mensagem,Data\n";
  messageLogs.forEach(log => {
    const phone = log.phone || "";
    const message = log.message ? `"${log.message.replace(/"/g, '""')}"` : "";
    const date = log.date || "";
    csv += `${phone},${message},${date}\n`;
  });

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=logs.csv");
  res.send(csv);
});

// Exportar JSON
app.get("/api/export/json", (req, res) => {
  if (messageLogs.length === 0) {
    return res.status(404).send("Nenhum log disponível");
  }

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", "attachment; filename=logs.json");
  res.send(JSON.stringify(messageLogs, null, 2));
});

// Rota padrão
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
