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

    if (!qrCode) {
      return res.json({ error: "Nenhum QR retornado pela Z-API" });
    }

    res.json({ qrCode });
  } catch (err) {
    console.error("Erro ao gerar QR Code:", err.message);
    res.status(500).json({ error: "Erro ao gerar QR Code" });
  }
});

// ===================== CONECTAR COM NÚMERO =====================
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
