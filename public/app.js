// ============================
// 📌 Gerar QR Code
// ============================
document.getElementById("generateQrBtn")?.addEventListener("click", async () => {
  const qrImage = document.getElementById("qrImage");
  const qrStatus = document.getElementById("qrStatus");

  qrStatus.innerText = "Gerando QR Code...";
  qrStatus.style.color = "#38bdf8";
  qrImage.style.display = "none";

  try {
    const res = await fetch("/api/qr");
    const data = await res.json();

    if (data.qrCode) {
      qrImage.src = data.qrCode; // 🚀 já vem pronto do back
      qrImage.style.display = "block";
      qrStatus.innerText = "QR Code gerado com sucesso!";
      qrStatus.style.color = "#22c55e";
    } else {
      qrStatus.innerText = "Erro ao carregar QR Code";
      qrStatus.style.color = "#ef4444";
    }
  } catch (err) {
    qrStatus.innerText = `Erro: ${err.message}`;
    qrStatus.style.color = "#ef4444";
  }
});

// ============================
// 📌 Enviar mensagem
// ============================
document.getElementById("sendForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const phone = document.getElementById("phone").value;
  const message = document.getElementById("message").value;
  const sendStatus = document.getElementById("sendStatus");

  sendStatus.innerText = "Enviando...";
  sendStatus.style.color = "#38bdf8";

  try {
    const res = await fetch("/api/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, message })
    });
    const data = await res.json();

    if (data.error) {
      sendStatus.innerText = `Erro: ${data.error}`;
      sendStatus.style.color = "#ef4444";
    } else {
      sendStatus.innerText = "Mensagem enviada!";
      sendStatus.style.color = "#22c55e";
      document.getElementById("sendForm").reset();
      loadHistory();
    }
  } catch (err) {
    sendStatus.innerText = `Erro: ${err.message}`;
    sendStatus.style.color = "#ef4444";
  }
});

// ============================
// 📌 Carregar histórico
// ============================
async function loadHistory() {
  const tbody = document.querySelector("#historyTable tbody");
  tbody.innerHTML = "<tr><td colspan='5'>Carregando...</td></tr>";

  try {
    const res = await fetch("/api/messages");
    const messages = await res.json();

    if (!messages.length) {
      tbody.innerHTML = "<tr><td colspan='5'>Nenhuma mensagem encontrada</td></tr>";
      return;
    }

    tbody.innerHTML = "";
    messages.forEach((msg) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${msg.id}</td>
        <td>${msg.phone}</td>
        <td>${msg.message}</td>
        <td>${msg.status}</td>
        <td>${msg.created_at}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan='5'>Erro: ${err.message}</td></tr>`;
  }
}

document.getElementById("refreshHistoryBtn")?.addEventListener("click", loadHistory);

// carregar histórico automaticamente
loadHistory();
