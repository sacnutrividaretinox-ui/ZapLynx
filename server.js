const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // serve arquivos HTML, CSS, etc

// Arquivos para logs e contatos
const LOGS_FILE = path.join(__dirname, "logs.json");
const CONTACTS_FILE = path.join(__dirname, "contacts.json");

// Cria se não existir
if (!fs.existsSync(LOGS_FILE)) fs.writeFileSync(LOGS_FILE, "[]");
if (!fs.existsSync(CONTACTS_FILE)) fs.writeFileSync(CONTACTS_FILE, "[]");

// ===================== QR CODE =====================
app.get("/api/generate-qr", async (req, res) => {
  try {
    const { ZAPI_INSTANCE_ID, ZAPI_TOKEN } = process.env;
    const url = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/qr-code`;

    const response = await axios.get(url);

    let qrCode = response.data.qrCode || response.data.qr || response.data.image;
    if (qrCode && !qrCode.startsWith("data:image")) {
      qrCode = `data:image/png;base64,${qrCode}`;
    }

    if (!qrCode) return res.json({ error: "Nenhum QR retornado pela Z-API" });

    res.json({ qrCode });
  } catch (err) {
    console.error("Erro ao gerar QR Code:", err.message);
    res.status(500).json({ error: "Erro ao gerar QR Code" });
  }
});

// ===================== NÚMERO MANUAL =====================
let numeroConectado = null;

app.post("/api/connect-number", (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: "Número inválido" });

  numeroConectado = phone;
  res.json({ conectado: true, phone });
});

app.get("/api/status-number", (req, res) => {
  if (numeroConectado) {
    res.json({ conectado: true, phone: numeroConectado });
  } else {
    res.json({ conectado: false });
  }
});

// ===================== ENVIAR MENSAGEM =====================
app.post("/api/send", async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone || !message) return res.status(400).json({ error: "Dados inválidos" });

    const { ZAPI_INSTANCE_ID, ZAPI_TOKEN } = process.env;
    const url = `https://api.z-api.io/instances/${ZAPI_INSTANCE_ID}/token/${ZAPI_TOKEN}/send-messages`;

    await axios.post(url, { phone, message });

    // salva log
    const logs = JSON.parse(fs.readFileSync(LOGS_FILE, "utf-8"));
    logs.push({ phone, message, date: new Date().toISOString() });
    fs.writeFileSync(LOGS_FILE, JSON.stringify(logs, null, 2));

    res.json({ success: true });
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err.message);
    res.status(500).json({ error: "Erro ao enviar mensagem" });
  }
});

// ===================== LOGS =====================
app.get("/api/logs", (req, res) => {
  const logs = JSON.parse(fs.readFileSync(LOGS_FILE, "utf-8"));
  res.json(logs);
});

// ===================== EXPORTAR =====================
app.get("/api/export/csv", (req, res) => {
  const logs = JSON.parse(fs.readFileSync(LOGS_FILE, "utf-8"));
  let csv = "phone,message,date\n";
  logs.forEach(l => {
    csv += `"${l.phone}","${l.message}","${l.date}"\n`;
  });

  res.header("Content-Type", "text/csv");
  res.attachment("logs.csv");
  res.send(csv);
});

app.get("/api/export/json", (req, res) => {
  const logs = JSON.parse(fs.readFileSync(LOGS_FILE, "utf-8"));
  res.json(logs);
});

// ===================== START =====================
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
