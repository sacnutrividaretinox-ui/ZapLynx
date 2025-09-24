document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  const qrImage = $("qrImage");
  const qrStatus = $("qrStatus");
  const btnQr = $("btnQr");

  const phoneInput = $("phone");
  const messageInput = $("message");
  const sendBtn = $("sendBtn");

  const refreshBtn = $("refreshBtn");
  const historyTbody = $("history");

  const btnConnectNumber = $("btnConnectNumber");
  const connectNumberInput = $("connectNumber");
  const connectStatus = $("connectStatus");

  // ============================
  // 📌 Gerar QR Code
  // ============================
  btnQr?.addEventListener("click", async () => {
    qrStatus.textContent = "⏳ Gerando QR Code...";
    qrImage.style.display = "none";
    qrImage.removeAttribute("src");

    try {
      const res = await fetch("/api/qr");
      const data = await res.json();

      if (!data || data.error) {
        qrStatus.textContent = "❌ Erro: " + (data?.error || "QR não retornado");
        qrStatus.style.color = "#ef4444";
        return;
      }

      let src = String(data.qrCode || "");
      if (!src.startsWith("data:image") && !src.startsWith("http")) {
        src = `data:image/png;base64,${src}`;
      }

      qrImage.src = src;
      qrImage.style.display = "block";
      qrStatus.textContent = "✅ QR Code gerado com sucesso!";
      qrStatus.style.color = "#22c55e";
    } catch (err) {
      qrStatus.textContent = "❌ Erro ao buscar QR: " + err.message;
      qrStatus.style.color = "#ef4444";
    }
  });

  // ============================
  // 📌 Conectar pelo Número
  // ============================
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

      if (data.error) {
        connectStatus.textContent = "❌ " + (data.error || "Erro ao conectar");
        connectStatus.style.color = "#ef4444";
      } else {
        connectStatus.textContent = "✅ Conectado com sucesso!";
        connectStatus.style.color = "#22c55e";
        console.log("Resposta:", data);
      }
    } catch (err) {
      connectStatus.textContent = "❌ Erro inesperado: " + err.message;
      connectStatus.style.color = "#ef4444";
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
    }
  });

  // ============================
  // 📌 Histórico + Estatísticas
  // ============================
  async function loadHistory() {
    historyTbody.innerHTML = "<tr><td colspan='5'>Carregando...</td></tr>";

    try {
      const res = await fetch("/api/messages");
      const data = await res.json();

      if (!data.length) {
        historyTbody.innerHTML = "<tr><td colspan='5'>Nenhuma mensagem encontrada</td></tr>";
        updateStats([]);
        return;
      }

      historyTbody.innerHTML = "";
      data.forEach((msg) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${msg.id}</td>
          <td>${msg.phone}</td>
          <td>${msg.message}</td>
          <td>${msg.status}</td>
          <td>${msg.created_at || msg.createdAt}</td>
        `;
        historyTbody.appendChild(tr);
      });

      updateStats(data);
    } catch (err) {
      historyTbody.innerHTML = `<tr><td colspan='5'>Erro: ${err.message}</td></tr>`;
    }
  }

  function updateStats(messages) {
    const get = (id) => document.querySelector(id)?.querySelector("span");
    const total = messages.length;
    const sent = messages.filter(m => m.status === "sent").length;
    const pending = messages.filter(m => m.status === "pending").length;
    const failed = messages.filter(m => m.status === "failed").length;

    get("#statTotal").textContent = total;
    get("#statSent").textContent = sent;
    get("#statPending").textContent = pending;
    get("#statFailed").textContent = failed;
  }

  refreshBtn?.addEventListener("click", loadHistory);
  loadHistory();
});
