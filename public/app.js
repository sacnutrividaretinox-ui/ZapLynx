document.addEventListener("DOMContentLoaded", () => {
  // --------- Helpers ---------
  const $ = (id) => document.getElementById(id);

  // Elements
  const qrImage   = $("qrImage");
  const qrStatus  = $("qrStatus");
  const btnQr     = $("btnQr") || $("generateQrBtn"); // <- aceita os dois IDs

  const phoneInput = $("phone");
  const messageInput = $("message");
  const sendBtn   = $("sendBtn");

  const refreshBtn = $("refreshBtn");
  const historyTbody = $("history");

  // ============================
  // 📌 Gerar QR Code
  // ============================
  async function handleGenerateQr() {
    if (!qrStatus || !qrImage) return console.warn("QR elements não encontrados.");
    qrStatus.textContent = "⏳ Gerando QR Code...";
    qrStatus.style.color = "#38bdf8";
    qrImage.style.display = "none";
    qrImage.removeAttribute("src");

    try {
      const res = await fetch("/api/qr", { cache: "no-store" });
      const data = await res.json();

      if (!data || data.error) {
        qrStatus.textContent = `❌ Erro: ${data?.error || "QR não retornado"}`;
        qrStatus.style.color = "#ef4444";
        console.error("Resposta /api/qr:", data);
        return;
      }

      let src = String(data.qrCode || "");
      // Normaliza se vier apenas o base64 cru
      if (!src.startsWith("data:image") && !src.startsWith("http")) {
        src = `data:image/png;base64,${src}`;
      }

      qrImage.src = src;
      qrImage.style.display = "block";
      qrStatus.textContent = "✅ QR Code gerado com sucesso!";
      qrStatus.style.color = "#22c55e";
      console.log("QR aplicado:", src.slice(0, 50) + "...");
    } catch (err) {
      qrStatus.textContent = `❌ Erro ao buscar QR: ${err.message}`;
      qrStatus.style.color = "#ef4444";
      console.error(err);
    }
  }

  // Garante que o evento existe mesmo se mudarem o ID no HTML
  if (btnQr) {
    btnQr.addEventListener("click", handleGenerateQr);
  } else {
    console.warn("Botão de QR não encontrado. Use id='btnQr' ou id='generateQrBtn' no HTML.");
  }

  // ============================
  // 📌 Enviar mensagem
  // ============================
  sendBtn?.addEventListener("click", async () => {
    const phone = phoneInput?.value.trim();
    const message = messageInput?.value.trim();

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
        return;
      }

      alert("📨 Mensagem enviada!");
      if (phoneInput) phoneInput.value = "";
      if (messageInput) messageInput.value = "";
      loadHistory();
    } catch (err) {
      alert("❌ Erro inesperado ao enviar: " + err.message);
    }
  });

  // ============================
  // 📌 Histórico + Estatísticas
  // ============================
  async function loadHistory() {
    if (!historyTbody) return;
    historyTbody.innerHTML = "<tr><td colspan='5'>Carregando...</td></tr>";

    try {
      const res = await fetch("/api/messages", { cache: "no-store" });
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
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
          <td>${msg.created_at || msg.createdAt || ""}</td>
        `;
        historyTbody.appendChild(tr);
      });

      updateStats(data);
    } catch (err) {
      historyTbody.innerHTML = `<tr><td colspan='5'>Erro: ${err.message}</td></tr>`;
    }
  }

  function updateStats(messages) {
    const get = (sel) => document.querySelector(sel)?.querySelector("span");
    const total   = messages.length;
    const sent    = messages.filter(m => m.status === "sent").length;
    const pending = messages.filter(m => m.status === "pending").length;
    const failed  = messages.filter(m => m.status === "failed").length;

    get("#statTotal")  && (get("#statTotal").textContent = total);
    get("#statSent")   && (get("#statSent").textContent = sent);
    get("#statPending")&& (get("#statPending").textContent = pending);
    get("#statFailed") && (get("#statFailed").textContent = failed);
  }

  refreshBtn?.addEventListener("click", loadHistory);

  // Carrega histórico ao abrir
  loadHistory();
});
