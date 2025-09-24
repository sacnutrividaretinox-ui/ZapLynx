// server.js
import express from "express";
import axios from "axios";
import cors from "cors";
import path from "path";
import db from "./db.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(process.cwd(), "public")));

// 🔑 Configuração Z-API (coloque suas credenciais corretas)
const ZAPI = {
  instanceId: process.env.ZAPI_INSTANCE_ID || "SUA_INSTANCIA",
  token: process.env.ZAPI_TOKEN || "SEU_TOKEN",
  clientToken: process.env.ZAPI_CLIENT_TOKEN || "SEU_CLIENT_TOKEN",
};

// ✅ Enviar mensagem
app.post("/send", async (req, res) => {
  try {
    const { phone, message } = req.body;
    const url = `https://api.z-api.io/instances/${ZAPI.instanceId}/token/${ZAPI.token}/send-text`;

    const response = await axios.post(url, {
      phone,
      message,
    });

    // Salvar mensagem no banco
    db.data.mensagens.push({
      id: Date.now(),
      phone,
      message,
      enviadoEm: new Date(),
    });
    await db.write();

    res.json({ success: true, response: response.data });
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error.message);
    res.status(500).json({ error: "Falha ao enviar mensagem" });
  }
});

// 📌 Listar mensagens
app.get("/mensagens", async (req, res) => {
  await db.read();
  res.json(db.data.mensagens);
});

// 📌 Adicionar instância
app.post("/instancia", async (req, res) => {
  const { nome, descricao } = req.body;

  db.data.instancias.push({
    id: Date.now(),
    nome,
    descricao,
    criadaEm: new Date(),
  });
  await db.write();

  res.json({ success: true, instancias: db.data.instancias });
});

// 📌 Listar instâncias
app.get("/instancias", async (req, res) => {
  await db.read();
  res.json(db.data.instancias);
});

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`✅ Servidor rodando na porta ${PORT}`));
