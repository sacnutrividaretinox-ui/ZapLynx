# ZapLynx 🚀

Micro-SaaS para envio de mensagens via **WhatsApp + Z-API**, com suporte a **SQLite (better-sqlite3)** para histórico de mensagens.  
Interface simples para **conectar via QR Code**, **enviar mensagens** e **consultar histórico**.

---

## ⚡ Funcionalidades
- Conectar WhatsApp via **QR Code** (Z-API).  
- Enviar mensagens individuais.  
- Histórico de mensagens com status (`pending`, `sent`).  
- Banco local SQLite (`data.db`).  
- Deploy simples no **Railway**.  

---

## 📂 Estrutura do Projeto

---

## 🔑 Variáveis de Ambiente (Railway ou .env)
No Railway, vá em **Settings → Variables** e adicione:

```ini
ZAPI_INSTANCE_ID=3E6DD0DEED00C0FD52197AE2AD17DA62
ZAPI_TOKEN=9E09CAB81F22425F5954C6C2
ZAPI_CLIENT_TOKEN=Fd1c0871baaa5449db5ea1628166c0566S
PORT=8080
git clone https://github.com/seu-repo/zaplynx.git
cd zaplynx
npm install
npm start
git add .
git commit -m "Descrição da atualização"
git push

---

👉 Esse README você coloca na raiz do projeto (`README.md`).  
Assim quando abrir no GitHub ou Railway, fica toda a documentação pronta.  

Quer que eu já adicione também **instruções extras para migrar de SQLite para Postgres** (Railway addon grátis)?
