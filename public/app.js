// Alternar blocos de conexão
function alternarModo() {
  const modo = document.getElementById("modoConexao").value;
  document.getElementById("bloco-qr").style.display = (modo === "qr") ? "block" : "none";
  document.getElementById("bloco-numero").style.display = (modo === "numero") ? "block" : "none";
}

// ============================
// 📌 Função: Gerar QR Code
// ============================
async function gerarQRCode() {
  const qrImg = document.getElementById("qrCode");
  const statusEl = document.getElementById("status-qr");

  statusEl.textContent = "⏳ Gerando QR Code...";

  try {
    const res = await fetch("/api/qr");
    const data = await res.json();

    if (data?.value) {
      qrImg.src = data.value;
      qrImg.style.display = "block";
      statusEl.textContent = "✅ QR Code gerado com sucesso!";
    } else {
      statusEl.textContent = "⚠️ Nenhum QR retornado.";
      qrImg.style.display = "none";
    }
  } catch (err) {
    statusEl.textContent = "❌ Erro ao gerar QR Code.";
    console.error(err);
  }
}

// ============================
// 📌 Função: Conectar pelo Número (Pairing Code)
// ============================
async function conectarNumero() {
  const phone = document.getElementById("numero").value;
  const statusEl = document.getElementById("status-numero");

  statusEl.textContent = "⏳ Solicitando Pairing Code...";

  try {
    const res = await fetch(`/api/connect-number/${phone}`);
    const data = await res.json();

    if (data?.value) {
      statusEl.textContent = "✅ Pairing Code: " + data.value;
      alert("Digite esse código no WhatsApp: " + data.value);
    } else {
      statusEl.textContent = "⚠️ Nenhum código retornado.";
    }
  } catch (err) {
    statusEl.textContent = "❌ Erro ao conectar pelo número.";
    console.error(err);
  }
}

// ============================
// 📌 Função: Enviar Mensagem
// ============================
async function enviarMensagem() {
  const phone = document.getElementById("telefone").value;
  const message = document.getElementById("mensagem").value;
  const statusEl = document.getElementById("status-msg");

  statusEl.textContent = "⏳ Enviando mensagem...";

  try {
    const res = await fetch("/api/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message })
    });

    const data = await res.json();

    if (data?.status === "success") {
      statusEl.textContent = "✅ Mensagem enviada!";
    } else {
      statusEl.textContent = "⚠️ Erro ao enviar mensagem.";
    }
  } catch (err) {
    statusEl.textContent = "❌ Erro ao enviar mensagem.";
    console.error(err);
  }
}
