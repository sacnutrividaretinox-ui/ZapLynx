// Gerar QR Code
async function gerarQRCode() {
  const res = await fetch("/api/qrcode");
  const data = await res.json();

  if (data?.value) {
    document.getElementById("qrcodeImg").src = data.value;
    document.getElementById("status").innerText = "✅ QR Code gerado!";
  } else {
    document.getElementById("status").innerText = "⚠️ Nenhum QR retornado.";
  }
}

// Conectar pelo Número (Pairing Code)
async function conectarNumero() {
  const phone = document.getElementById("phoneInput").value;
  const res = await fetch(`/api/connect-number/${phone}`);
  const data = await res.json();

  if (data?.pairingCode) {
    document.getElementById("statusNumero").innerText =
      `📲 Digite este código no WhatsApp: ${data.pairingCode}`;
  } else {
    document.getElementById("statusNumero").innerText = "⚠️ Nenhum código retornado.";
  }
}

// Enviar mensagem
async function enviarMensagem() {
  const phone = document.getElementById("msgPhone").value;
  const message = document.getElementById("msgText").value;

  const res = await fetch("/api/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, message })
  });

  const data = await res.json();
  document.getElementById("statusMsg").innerText =
    data?.id ? "✅ Mensagem enviada!" : "⚠️ Erro ao enviar.";
}
