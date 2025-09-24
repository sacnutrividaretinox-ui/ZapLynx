document.addEventListener("DOMContentLoaded", () => {
  const qrImage = document.getElementById("qrImage");
  const qrStatus = document.getElementById("qrStatus");
  const btnQr = document.getElementById("btnQr");

  const phoneInput = document.getElementById("phone");
  const messageInput = document.getElementById("message");
  const sendBtn = document.getElementById("sendBtn");

  const refreshBtn = document.getElementById("refreshBtn");
  const historyTable = document.getElementById("history");

  // ============================
  // 📌 Gerar QR Code
  // ============================
  btnQr?.addEventListener("click", async () => {
    qrStatus.textContent = "⏳ Gerando QR Code...";
    qrStatus.style.color = "#38bdf8";
    qrImage.style.display = "none";
    qrImage.removeAttribute("src");

    try {
      const res = await fetch("/api/qr");
      const data = await res.json();

      if (data.qrCode) {
        qrImage.src = data.qrCode; // 🚀 já vem pronto do back
        qrImage.style.display = "block";
        qrStatus.textContent = "✅ QR Code gerado com sucesso!";
        qrStatus.style.color = "#22c55e";
      } else {
        qrStatus.textContent = "⚠️ Erro: QR Code não retornado.";
        qrStatus.style.color = "#ef4444";
        console.error("Resposta inesperada:", data);
      }
    } catch (err) {
      qrStatus.textContent = "❌ Erro ao buscar QR Code.";
      qrStatus.style.color = "#ef4444";
      console.error(err);
    }
  });

  // ============================
  // 📌 Enviar mensagem
  // ============================
  sendBtn?.addEventListener("click", async () => {
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

      if (data.error) {
        alert("❌ Erro ao enviar: " + data.error);
      } else {
        alert("📨 Mensagem enviada!");
        phoneInput.value = "";
        messageInput.value = "";
        loadHistory();
      }
    } catch (err) {
      alert("❌ Erro inesperado ao enviar mensagem.");
      console.error(err);
    }
  });

  // ============================
  // 📌 Carregar histórico
  // ============================
  async function loadHistory() {
    historyTable.innerHTML = "<tr><td colspan='5'>Carregando...</td></tr>";

    try {
      const res = await fetch("/api/messages");
      const data = await res.json();

      if (!data.length) {
        historyTable.innerHTML = "<tr><td colspan='5'>Nenhuma mensagem encontrada</td></tr>";
        return;
      }

      historyTable.innerHTML = "";
      data.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${row.id}</td>
          <td>${row.phone}</td>
          <td>${row.message}</td>
          <td>${row.status}</td>
          <td>${row.created_at || row.createdAt}</td>
        `;
        historyTable.appendChild(tr);
      });
    } catch (err) {
      historyTable.innerHTML = `<tr><td colspan='5'>Erro: ${err.message}</td></tr>`;
      console.error(err);
    }
  }

  refreshBtn?.addEventListener("click", loadHistory);

  // Carregar histórico ao abrir
  loadHistory();
});
