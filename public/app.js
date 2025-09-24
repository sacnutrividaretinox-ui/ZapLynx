// ============================
// 📌 Gerar QR Code
// ============================
document.getElementById("btn-qr").addEventListener("click", async () => {
  const qrStatus = document.getElementById("qr-status");
  const qrImage = document.getElementById("qr-image");

  qrStatus.textContent = "⏳ Gerando QR Code...";
  qrImage.style.display = "none";
  qrImage.src = "";

  try {
    const res = await fetch("/api/qr");
    const data = await res.json();

    console.log("Resposta da API /api/qr:", data);

    if (data.qrCode) {
      // Caso venha já em base64 ou sem prefixo
      qrImage.src = data.qrCode.startsWith("data:image")
        ? data.qrCode
        : `data:image/png;base64,${data.qrCode}`;
      qrImage.style.display = "block";
      qrStatus.textContent = "✅ QR Code gerado com sucesso!";
    } else if (data.connected) {
      qrStatus.textContent = "✅ WhatsApp já está conectado!";
    } else {
      qrStatus.textContent = "⚠️ Nenhum QR retornado. Veja os logs.";
    }
  } catch (err) {
    console.error("Erro ao buscar QR:", err);
    qrStatus.textContent = "❌ Erro ao gerar QR Code.";
  }
});

// ============================
// 📌 Enviar Mensagem
// ============================
document.getElementById("btn-send").addEventListener("click", async () => {
  const phone = document.getElementById("phone").value.trim();
  const message = document.getElementById("message").value.trim();
  const status = document.getElementById("send-status");

  if (!phone || !message) {
    status.textContent = "⚠️ Informe o número e a mensagem!";
    return;
  }

  status.textContent = "⏳ Enviando...";

  try {
    const res = await fetch("/api/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message })
    });

    const data = await res.json();
    console.log("Resposta da API /api/send-message:", data);

    if (data.error) {
      status.textContent = "❌ Erro: " + data.error;
    } else {
      status.textContent = "✅ Mensagem enviada com sucesso!";
    }
  } catch (err) {
    console.error("Erro ao enviar mensagem:", err);
    status.textContent = "❌ Erro ao enviar mensagem.";
  }
});
