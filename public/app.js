// ============================
// 📌 Gerar QR Code
// ============================
const btnQr = document.getElementById("btnGenerateQR");
const qrImg = document.getElementById("qrImage");
const qrStatus = document.getElementById("qrStatus");

btnQr?.addEventListener("click", async () => {
  qrStatus.textContent = "⏳ Gerando QR Code...";
  qrStatus.style.color = "#38bdf8";

  try {
    const res = await fetch("/api/qr");
    const data = await res.json();
    console.log("📥 Resposta /api/qr:", data);

    if (data.qrCode) {
      qrImg.src = data.qrCode;
      qrImg.style.display = "block";
      qrStatus.textContent = "✅ QR Code gerado com sucesso!";
      qrStatus.style.color = "#22c55e";
    } else if (data.debug) {
      qrStatus.textContent = "⚠️ Formato inesperado (veja console)";
      qrStatus.style.color = "#fbbf24";
    } else {
      qrStatus.textContent = "❌ " + (data.error || "Erro ao gerar QR");
      qrStatus.style.color = "#ef4444";
    }
  } catch (err) {
    qrStatus.textContent = "❌ Erro inesperado: " + err.message;
    qrStatus.style.color = "#ef4444";
  }
});

// ============================
// 📌 Conectar pelo Número
// ============================
const btnConnectNumber = document.getElementById("btnConnectNumber");
const connectNumberInput = document.getElementById("connectNumber");
const connectStatus = document.getElementById("connectStatus");

btnConnectNumber?.addEventListener("click", async () => {
  const number = connectNumberInput.value.trim();
  if (!number) {
    alert("Digite um número para conectar!");
    return;
  }

  connectStatus.textContent = "⏳ Conectando...";
  connectStatus.style.color = "#38bdf8";

  try {
    const res = await fetch("/api/connect-number", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ number })
    });
    const data = await res.json();
    console.log("📥 Resposta /api/connect-number:", data);

    if (data.error) {
      connectStatus.textContent = "❌ " + data.error;
      connectStatus.style.color = "#ef4444";
    } else {
      connectStatus.textContent = "✅ Conectado com sucesso!";
      connectStatus.style.color = "#22c55e";
    }
  } catch (err) {
    connectStatus.textContent = "❌ Erro inesperado: " + err.message;
    connectStatus.style.color = "#ef4444";
  }
});
