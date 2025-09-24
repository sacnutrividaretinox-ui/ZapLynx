// ============================
// 📌 Carregar histórico + estatísticas
// ============================
async function loadHistory() {
  historyTable.innerHTML = "<tr><td colspan='5'>Carregando...</td></tr>";

  try {
    const res = await fetch("/api/messages");
    const data = await res.json();

    if (!data.length) {
      historyTable.innerHTML = "<tr><td colspan='5'>Nenhuma mensagem encontrada</td></tr>";
      updateStats([]); // atualiza estatísticas com vazio
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

    // Atualiza estatísticas
    updateStats(data);
  } catch (err) {
    historyTable.innerHTML = `<tr><td colspan='5'>Erro: ${err.message}</td></tr>`;
    console.error(err);
  }
}

// ============================
// 📌 Atualizar estatísticas
// ============================
function updateStats(messages) {
  const total = messages.length;
  const sent = messages.filter(m => m.status === "sent").length;
  const pending = messages.filter(m => m.status === "pending").length;
  const failed = messages.filter(m => m.status === "failed").length;

  document.getElementById("statTotal").textContent = total;
  document.getElementById("statSent").textContent = sent;
  document.getElementById("statPending").textContent = pending;
  document.getElementById("statFailed").textContent = failed;
}
