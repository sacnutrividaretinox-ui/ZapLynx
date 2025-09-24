// public/app.js

async function gerarQRCode() {
  const qrDiv = document.getElementById("qrCodeContainer");
  qrDiv.innerHTML = "⏳ Aguardando ação...";

  try {
    const res = await fetch("/api/qr");
    const data = await res.json();

    console.log("Resposta bruta /api/qr:", data);

    if (data.qrCode) {
      // Se veio um base64 → renderiza a imagem
      qrDiv.innerHTML = `<img src="data:image/png;base64,${data.qrCode}" 
        alt="QR Code" style="max-width:250px; border:2px solid #00ffcc; border-radius:8px"/>`;
    } else if (data.connected) {
      // Se já está conectado
      qrDiv.innerHTML = `<p style="color:#00ffcc; font-weight:bold;">✅ WhatsApp já conectado!</p>`;
    } else {
      qrDiv.innerHTML = `<p style="color:#ff4444;">⚠ Nenhum QR retornado. Veja os logs.</p>`;
    }
  } catch (err) {
    console.error("Erro ao gerar QR:", err);
    qrDiv.innerHTML = `<p style="color:#ff4444;">❌ Erro ao gerar QR Code</p>`;
  }
}

// Enviar mensagem
async function enviarMensagem() {
  const phone = document.getElementById("numero").value;
  const message = document.getElementById("mensagem").value;

  try {
    const res = await fetch("/api/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message })
    });

    const data = await res.json();
    console.log("Resposta /send-message:", data);

    alert("Mensagem enviada!");
  } catch (err) {
    console.error("Erro ao enviar:", err);
    alert("Erro ao enviar mensagem!");
  }
}
