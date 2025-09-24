const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ================== LOGS ==================
const LOG_FILE = path.join(__dirname, "logs.json");
let messageLogs = [];
if (fs.existsSync(LOG_FILE)) {
  try {
    messageLogs = JSON.parse(fs.readFileSync(LOG_FILE, "utf-8"));
  } catch {
    messageLogs = [];
  }
}
function salvarLog(log) {
  messageLogs.push(log);
  fs.writeFileSync(LOG_FILE, JSON.stringify(messageLogs, null, 2));
}

// ================== CONTATOS ==================
const CONTACTS_FILE = path.join(__dirname, "contacts.json");
let contatos = [];
if (fs.existsSync(CONTACTS_FILE)) {
  try {
    contatos = JSON.parse(fs.readFileSync(CONTACTS_FILE, "utf-8"));
  } catch {
    contatos = [];
  }
}
function salvarContatos() {
  fs.writeFileSync(CONTACTS_FILE, JSON.stringify(contatos, null, 2));
}

// ================== ROTAS ==================

// Arquivos estáticos
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

    salvarLog({ phone, message, date: new Date().toISOString() });
    res.json(response.data);
  } catch (err) {
    console.error("Erro envio:", err.message);
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

// Estatísticas
app.get("/api/stats", (req, res) => {
  const labels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  let data = [0, 0, 0, 0, 0, 0, 0];
  messageLogs.forEach(log => {
    const day = new Date(log.date).getDay();
    data[day]++;
  });
  res.json({ labels, data });
});

// Histórico
app.get("/api/history", (req, res) => {
  res.json(messageLogs.slice(-20).reverse());
});

// Exportar CSV
app.get("/api/export/csv", (req, res) => {
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
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Content-Disposition", "attachment; filename=logs.json");
  res.send(JSON.stringify(messageLogs, null, 2));
});

// QR Code da Z-API
app.get("/api/generate-qr", async (req, res) => {
  try {
    const ZAPI = {
      instanceId: process.env.ZAPI_INSTANCE_ID,
      token: process.env.ZAPI_TOKEN
    };
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/qr-code`;
    const response = await axios.get(url);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Erro ao gerar QR Code" });
  }
});

// Conectar número
let numeroConectado = null;
app.post("/api/connect-number", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Número inválido" });
  numeroConectado = phone;
  res.json({ phone });
});

// Contatos
app.get("/api/contatos", (req, res) => res.json(contatos));
app.post("/api/contatos", (req, res) => {
  const { nome, numero } = req.body;
  if (!nome || !numero) return res.status(400).json({ error: "Dados inválidos" });
  contatos.push({ nome, numero });
  salvarContatos();
  res.json({ success: true });
});
app.post("/api/contatos/import", upload.single("file"), (req, res) => {
  try {
    const csv = fs.readFileSync(req.file.path, "utf-8");
    csv.split("\n").forEach(l => {
      const [nome, numero] = l.split(",");
      if (nome && numero) contatos.push({ nome: nome.trim(), numero: numero.trim() });
    });
    salvarContatos();
    fs.unlinkSync(req.file.path);
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Erro ao importar CSV" });
  }
});

// Rotas padrão
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.get("*", (req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`🚀 Rodando na porta ${PORT}`));
