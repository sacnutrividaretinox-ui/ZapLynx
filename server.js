const express = require("express");
const cors = require("cors");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ===== Banco de Dados (SQLite) =====
const db = new sqlite3.Database(path.join(__dirname, "data.db"));
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      campanha TEXT,
      mensagem TEXT,
      status TEXT,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

// ===== Endpoint: enviar mensagem (exemplo mock) =====
app.post("/send", (req, res) => {
  const { message, campanha } = req.body;

  // 👉 Aqui você colocaria a integração com Z-API
  // await axios.post(...)

  db.run(
    "INSERT INTO logs (campanha, mensagem, status) VALUES (?, ?, ?)",
    [campanha || "sem-campanha", message, "enviado"],
    (err) => {
      if (err) return res.status(500).json({ error: "Erro ao salvar log" });
      res.json({ ok: true });
    }
  );
});

// ===== Endpoint: Dashboard =====
app.get("/api/dashboard", (req, res) => {
  const stats = { hoje: 0, ontem: 0, seteDias: 0, trintaDias: 0, umAno: 0 };

  db.serialize(() => {
    db.get(
      `SELECT COUNT(*) as total FROM logs WHERE DATE(criado_em) = DATE('now')`,
      (err, row) => (stats.hoje = row.total)
    );
    db.get(
      `SELECT COUNT(*) as total FROM logs WHERE DATE(criado_em) = DATE('now', '-1 day')`,
      (err, row) => (stats.ontem = row.total)
    );
    db.get(
      `SELECT COUNT(*) as total FROM logs WHERE DATE(criado_em) >= DATE('now', '-7 day')`,
      (err, row) => (stats.seteDias = row.total)
    );
    db.get(
      `SELECT COUNT(*) as total FROM logs WHERE DATE(criado_em) >= DATE('now', '-30 day')`,
      (err, row) => (stats.trintaDias = row.total)
    );
    db.get(
      `SELECT COUNT(*) as total FROM logs WHERE DATE(criado_em) >= DATE('now', '-1 year')`,
      (err, row) => {
        stats.umAno = row.total;
        res.json(stats);
      }
    );
  });
});

// ===== Endpoint: campanhas =====
app.get("/api/campanhas", (req, res) => {
  db.all("SELECT DISTINCT campanha FROM logs ORDER BY campanha", (err, rows) => {
    if (err) return res.status(500).json({ error: "Erro ao carregar campanhas" });
    res.json(rows.map(r => r.campanha));
  });
});

// ===== Endpoint: histórico agrupado =====
app.get("/api/historico", (req, res) => {
  db.all("SELECT * FROM logs ORDER BY campanha, criado_em DESC", (err, rows) => {
    if (err) return res.status(500).json({ error: "Erro ao carregar logs" });

    const grouped = {};
    rows.forEach(log => {
      if (!grouped[log.campanha]) grouped[log.campanha] = [];
      grouped[log.campanha].push(log);
    });

    res.json(grouped);
  });
});

// ===== Endpoint: gráfico por campanha =====
app.get("/api/historico/:campanha", (req, res) => {
  const campanha = req.params.campanha;
  db.all(
    "SELECT status, COUNT(*) as total FROM logs WHERE campanha = ? GROUP BY status",
    [campanha],
    (err, rows) => {
      if (err) return res.status(500).json({ error: "Erro ao carregar dados" });
      res.json(rows);
    }
  );
});

// ===== Inicialização =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
