document.getElementById("generateQrBtn").addEventListener("click", async () => {
  const qrImage = document.getElementById("qrImage");
  const qrStatus = document.getElementById("qrStatus");

  qrStatus.innerText = "Gerando QR Code...";
  qrStatus.style.color = "#00bcd4";
  qrImage.style.display = "none";

  try {
    // Aguarda 2 segundos antes da chamada (evita flood)
    await new Promise(r => setTimeout(r, 2000));

    const res = await fetch("/api/qr");
    const data = await res.json();

    if (data.error) {
      qrStatus.innerText = `Erro: ${data.error}`;
      qrStatus.style.color = "red";
      return;
    }

    qrImage.src = `data:image/png;base64,${data.qrCode}`;
    qrImage.style.display = "block";
    qrStatus.innerText = "QR Code gerado com sucesso!";
    qrStatus.style.color = "limegreen";

  } catch (err) {
    qrStatus.innerText = `Erro inesperado: ${err.message}`;
    qrStatus.style.color = "red";
  }
});
