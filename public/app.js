// public/app.js

document.addEventListener("DOMContentLoaded", () => {
  const qrResult = document.getElementById("qrResult");
  const statusResult = document.getElementById("statusResult");
  const btnQr = document.getElementById("btnQr");
  const btnConectarNumero = document.getElementById("btnConectarNumero");
  const inputNumero = document.getElementById("numero");

  // Função para gerar QR Code
  btnQr.addEventListener("click", async () => {
    qrResult.innerHTML = "⏳ Gerando QR Code...";
    try {
      const res = await fetch("/api/qrcode");
      const data = await res.json();

      if (data.value) {
        qrResult.innerHTML = `<img src="${data.value}" alt="QR Code" width="250"/>`;
      } else {
        qrResult.innerHTML = "❌ Nenhum QR retornado";
      }
    } catch (err) {
      console.error("Erro ao gerar QR:", err);
      qrResult.innerHTML = "❌ Erro ao gerar QR Code";
    }
  });

  // Função para conectar número
  btnConectarNumero.addEventListener("click", async () => {
    const numero = inputNumero.value.trim();
    if (!numero) {
      statusResult.innerHTML = "❌ Informe um número!";
      return;
    }

    statusResult.innerHTML = "⏳ Conectando...";
    try {
      const res = await fetch("/api/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numero }),
      });

      const data = await res.json();
      if (data.success) {
        statusResult.innerHTML = `✅ Conectado: ${numero}`;
      } else {
        statusResult.innerHTML = `❌ Falha: ${data.error || "Erro desconhecido"}`;
      }
    } catch (err) {
      console.error("Erro ao conectar número:", err);
      statusResult.innerHTML = "❌ Erro na conexão";
    }
  });

  // Função para checar status a cada 5s
  async function checkStatus() {
    try {
      const res = await fetch("/api/status");
      const data = await res.json();

      if (data.connected) {
        statusResult.innerHTML = `✅ Número conectado: ${data.number || "Desconhecido"}`;
      } else {
        statusResult.innerHTML = "❌ Não conectado";
      }
    } catch (err) {
      console.error("Erro ao checar status:", err);
      statusResult.innerHTML = "❌ Erro ao checar status";
    }
  }

  // Checar status automaticamente a cada 5 segundos
  setInterval(checkStatus, 5000);
  checkStatus(); // rodar já ao carregar
});
