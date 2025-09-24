async function loadHistory() {
  const tbody = document.getElementById("history");
  tbody.innerHTML = "<tr><td colspan='5'>Carregando...</td></tr>";

  try {
    const res = await fetch("/api/messages");
    const data = await res.json();

    if (!data.length) {
      tbody.innerHTML = "<tr><td colspan='5'>Nenhuma mensagem encontrada</td></tr>";
      updateStats([]);
      return;
    }

    tbody.innerHTML = "";
    data.forEach(msg => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${msg.id}</td>
        <td>${msg.phone}</td>
        <td>${msg.message}</td>
        <td>${msg.status}</td>
        <td>${msg.created_at || msg.createdAt}</td>
      `;
      tbody.appendChild(tr);
    });

    updateStats(data);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan='5'>Erro: ${err.message}</td></tr>`;
  }
}

function updateStats(messages) {
  document.querySelector("#statTotal span").textContent = messages.length;
  document.querySelector("#statSent span").textContent = messages.filter(m => m.status === "sent").length;
  document.querySelector("#statPending span").textContent = messages.filter(m => m.status === "pending").length;
  document.querySelector("#statFailed span").textContent = messages.filter(m => m.status === "failed").length;
}
