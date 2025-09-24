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
    console.log("📥 Resposta bruta /api/qr:", data);

    // Tentativas de localizar QR
    if (data.qrCode || data.base64 || data.value || data.url) {
      const qr = data.qrCode || data.base64 || data.value || data.url;
      qrImg.src = qr.startsWith("data:image") ? qr : `data:image/png;base64,${qr}`;
      qrImg.style.display = "block";
      qrStatus.textContent = "✅ QR Code gerado!";
      qrStatus.style.color = "#22c55e";
    } else {
      qrStatus.textContent = "⚠️ Veja console → resposta bruta";
      qrStatus.style.color = "#fbbf24";
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
    console.log("📥 Resposta bruta /api/connect-number:", data);

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
