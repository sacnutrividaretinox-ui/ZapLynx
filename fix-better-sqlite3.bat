Write-Host "========================================"
Write-Host "🚀 FIX para instalar/compilar better-sqlite3"
Write-Host "========================================"

# 1. Baixar e instalar o Microsoft Visual C++ Redistributable
Write-Host "🔹 [1/4] Baixando Microsoft Visual C++ Redistributable..."
Invoke-WebRequest -Uri "https://aka.ms/vs/17/release/vc_redist.x64.exe" -OutFile "vc_redist.x64.exe"

Write-Host "🔹 Instalando Redistributable..."
Start-Process -FilePath ".\vc_redist.x64.exe" -ArgumentList "/install", "/quiet", "/norestart" -Wait
Write-Host "✅ Redistributable instalado."

# 2. Abrir o Visual Studio Installer (caso precise instalar Desktop development with C++)
Write-Host "🔹 [2/4] Abrindo Visual Studio Installer..."
Start-Process "C:\Program Files (x86)\Microsoft Visual Studio\Installer\vs_installer.exe"
Write-Host "⚠️ Certifique-se de marcar 'Desktop development with C++' e instalar!"
Pause

# 3. Limpar dependências do projeto
Write-Host "🔹 [3/4] Limpando dependências do projeto..."
Remove-Item -Recurse -Force .\node_modules
Remove-Item -Force package-lock.json
npm cache clean --force

# 4. Reinstalar pacotes e rebuild do better-sqlite3
Write-Host "🔹 [4/4] Instalando dependências e rebuild do better-sqlite3..."
npm install
npm rebuild better-sqlite3 --build-from-source

Write-Host "========================================"
Write-Host "✅ Processo finalizado!"
Write-Host "Agora rode 'npm start' para testar seu projeto."
Write-Host "========================================"
Pause
