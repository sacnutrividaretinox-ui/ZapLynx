document.addEventListener("DOMContentLoaded", () => {
  const btnQr = document.getElementById("btnQr");
  const qrResult = document.getElementById("qrResult");

  const btnConnectNumber = document.getElementById("btnConnectNumber");
  const numberInput = document.getElementById("numberInput");
  const numberResult = document.getElementById("numberResult");

  // Função para exibir mensagens de status/erro
  function showMessage(element, msg, success = false) {
    element.innerHTML = msg;
    element.style.color = success ? "limegreen" : "red";
  }

  // ✅ Gerar QR Code
  if (btnQr) {
    btnQr.addEventListener("click", async () => {
      showMessage(qrResult, "⏳ Gerando QR Code...");
      try {
        const response = await fetch("/api/generate-qr");
        const data = await response.json();

        if (data.qrCode) {
          qrResult.innerHTML = `<img src="${data.qrCode}" alt="QR Code" style="max-width:250px; border:2px solid #fff; border-radius:8px;" />`;
        } else if (data.error) {
          showMessage(qrResult, `❌ Erro: ${data.error}`);
          console.error("Erro detalhado:", data.details || data);
        } else {
          showMessage(qrResult, "❌ Nenhum QR retornado pela API");
        }
      } catch (err) {
        showMessage(qrResult, `❌ Falha ao gerar QR: ${err.message}`);
      }
    });
  }

  // ✅ Conectar com número
  if (btnConnectNumber) {
    btnConnectNumber.addEventListener("click", async () => {
      const phone = numberInput.value.trim();
      if (!phone) {
        return showMessage(numberResult, "⚠️ Informe um número");
      }

      showMessage(numberResult, "⏳ Conectando número...");

      try {
        const response = await fetch("/api/status");
        const data = await response.json();

        if (data.connected || data.status === "CONNECTED") {
          showMessage(numberResult, `✅ Conectado: ${phone}`, true);
        } else if (data.error) {
          showMessage(numberResult, `❌ Erro: ${data.error}`);
          console.error("Erro detalhado:", data.details || data);
        } else {
          showMessage(numberResult, "❌ Não conectado");
        }
      } catch (err) {
        showMessage(numberResult, `❌ Erro ao conectar: ${err.message}`);
      }
    });
  }
});
