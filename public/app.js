document.addEventListener("DOMContentLoaded", () => {
  const btnQr = document.getElementById("btnQr");
  const qrImg = document.getElementById("qrcode");
  const statusText = document.getElementById("status");

  const btnSend = document.getElementById("btnSend");
  const sendStatus = document.getElementById("sendStatus");

  // Gerar QR Code
  btnQr.addEventListener("click", async () => {
    statusText.textContent = "⏳ Gerando QR Code...";
    qrImg.style.display = "none";

    try {
      const res = await fetch("/api/qrcode");
      const data = await res.json();

      if (data.qr) {
        qrImg.src = data.qr; // já vem pronto
        qrImg.style.display = "block";
        statusText.textContent = "✅ Escaneie o QR Code no WhatsApp";
        statusText.style.color = "limegreen";
      } else {
        statusText.textContent = "❌ Nenhum QR retornado";
        statusText.style.color = "red";
      }
    } catch (err) {
      console.error("Erro ao gerar QR:", err);
      statusText.textContent = "❌ Erro ao gerar QR Code";
      statusText.style.color = "red";
    }
  });

  // Enviar Mensagem
  btnSend.addEventListener("click", async () => {
    const phone = document.getElementById("phone").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!phone || !message) {
      sendStatus.textContent = "⚠ Informe número e mensagem";
      sendStatus.style.color = "orange";
      return;
    }

    sendStatus.textContent = "⏳ Enviando...";

    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message })
      });

      const data = await res.json();
      if (data.error) {
        sendStatus.textContent = "❌ Erro: " + data.error;
        sendStatus.style.color = "red";
      } else {
        sendStatus.textContent = "✅ Mensagem enviada!";
        sendStatus.style.color = "limegreen";
      }
    } catch (err) {
      console.error("Erro ao enviar:", err);
      sendStatus.textContent = "❌ Erro ao enviar mensagem";
      sendStatus.style.color = "red";
    }
  });
});
