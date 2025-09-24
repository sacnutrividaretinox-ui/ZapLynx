document.addEventListener("DOMContentLoaded", () => {
  const qrBtn = document.getElementById("btnQr");
  const qrImg = document.getElementById("qrImage");
  const qrMsg = document.getElementById("qrMessage");

  const sendBtn = document.getElementById("btnSend");
  const phoneInput = document.getElementById("phone");
  const messageInput = document.getElementById("message");
  const sendMsg = document.getElementById("sendMessage");

  // ========================
  // 📌 Gerar QR Code
  // ========================
  qrBtn?.addEventListener("click", async () => {
    qrMsg.textContent = "⏳ Gerando QR Code...";
    qrMsg.style.color = "yellow";
    qrImg.style.display = "none";

    try {
      const res = await fetch("/api/qr");
      const data = await res.json();

      if (data.qrCode) {
        // Verifica se é Base64 ou URL
        if (data.qrCode.startsWith("data:image")) {
          qrImg.src = data.qrCode; // Base64 direto
        } else {
          qrImg.src = data.qrCode; // URL direto
        }
        qrImg.style.display = "block";
        qrMsg.textContent = "✅ QR Code gerado com sucesso!";
        qrMsg.style.color = "limegreen";
      } else if (data.error) {
        qrMsg.textContent = `⚠️ Erro: ${data.error}`;
        qrMsg.style.color = "red";
        console.warn("Erro detalhado:", data.details || data);
      } else {
        qrMsg.textContent = "⚠️ Nenhum QR retornado pela API.";
        qrMsg.style.color = "orange";
        console.warn("Resposta bruta:", data);
      }
    } catch (err) {
      qrMsg.textContent = "❌ Falha ao se conectar ao servidor.";
      qrMsg.style.color = "red";
      console.error("Erro no front-end:", err);
    }
  });

  // ========================
  // 📌 Enviar Mensagem
  // ========================
  sendBtn?.addEventListener("click", async () => {
    const phone = phoneInput.value.trim();
    const message = messageInput.value.trim();

    if (!phone || !message) {
      sendMsg.textContent = "⚠️ Informe número e mensagem.";
      sendMsg.style.color = "orange";
      return;
    }

    sendMsg.textContent = "⏳ Enviando...";
    sendMsg.style.color = "yellow";

    try {
      const res = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message }),
      });

      const data = await res.json();

      if (res.ok) {
        sendMsg.textContent = "✅ Mensagem enviada com sucesso!";
        sendMsg.style.color = "limegreen";
        console.log("Resposta Z-API:", data);
      } else {
        sendMsg.textContent = `❌ Erro: ${data.error || "Falha desconhecida"}`;
        sendMsg.style.color = "red";
        console.error("Erro detalhes:", data.details || data);
      }
    } catch (err) {
      sendMsg.textContent = "❌ Erro ao enviar mensagem.";
      sendMsg.style.color = "red";
      console.error("Erro no front-end:", err);
    }
  });
});
