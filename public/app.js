document.addEventListener("DOMContentLoaded", () => {
  const btnQr = document.getElementById("btnQr");
  const qrImage = document.getElementById("qrImage");
  const qrStatus = document.getElementById("qrStatus");

  const phoneInput = document.getElementById("phone");
  const messageInput = document.getElementById("message");
  const sendBtn = document.getElementById("sendBtn");
  const refreshBtn = document.getElementById("refreshBtn");
  const historyTable = document.getElementById("history");

  // Gerar QR Code
  btnQr.addEventListener("click", async () => {
    qrStatus.textContent = "⏳ Gerando QR Code...";
    qrImage.style.display = "none";

    try {
      const res = await fetch("/api/qr");
      const data = await res.json();

      if (data.qrCode) {
        // Se for base64
        if (data.qrCode.startsWith("data:image")) {
          qrImage.src = data.qrCode;
        } else {
          // Se for link pronto
          qrImage.src = data.qrCode;
        }
        qrImage.style.display = "block";
        qrStatus.textContent = "✅ QR Code gerado com sucesso!";
      } else {
        qrStatus.textContent = "⚠️ Erro: QR Code não retornado.";
        console.error("Resposta inesperada:", data);
      }
    } catch (err) {
      qrStatus.textContent = "❌ Erro ao buscar QR Code.";
      console.error(err);
    }
  });

  // Enviar mensagem
  sendBtn.addEventListener("click", async () => {
    const phone = phoneInput.value.trim();
    const message = messageInput.value.trim();
    if (!phone || !message) {
      alert("Preencha número e mensagem!");
      return;
    }

    try {
      const res = await fetch("/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, message })
      });

      const data = await res.json();
      alert("📨 Mensagem enviada! Verifique logs.");
      console.log("Resposta:", data);
    } catch (err) {
      alert("❌ Erro ao enviar mensagem.");
      console.error(err);
    }
  });

  // Atualizar histórico
  refreshBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("/api/messages");
      const data = await res.json();

      historyTable.innerHTML = "";
      data.forEach(row => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.id}</td>
          <td>${row.phone}</td>
          <td>${row.message}</td>
          <td>${row.status}</td>
          <td>${row.createdAt}</td>
        `;
        historyTable.appendChild(tr);
      });
    } catch (err) {
      console.error("Erro ao buscar histórico:", err);
    }
  });
});
