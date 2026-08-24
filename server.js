const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;
const db = new sqlite3.Database("./cdp.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS names (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    expires_at INTEGER NOT NULL
  )`);
});

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/names", (req, res) => {
  db.all("SELECT id, name, expires_at FROM names ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: "Erro no banco de dados." });
    res.json(rows);
  });
});

app.post("/api/names", (req, res) => {
  const name = String(req.body.name || "").trim().replace(/\s+/g, " ");
  if (!name) return res.status(400).json({ error: "Digite um nome." });
  if (name.length > 40) return res.status(400).json({ error: "O nome pode ter no máximo 40 caracteres." });

  const expiresAt = Date.now() + 5 * 60 * 60 * 1000;
  db.run("INSERT INTO names (name, expires_at) VALUES (?, ?)", [name, expiresAt], function(err) {
    if (err) return res.status(500).json({ error: "Não foi possível adicionar o nome." });
    res.json({ id: this.lastID, name, expires_at: expiresAt });
  });
});

app.listen(PORT, () => console.log(`CDP DE INVASORES rodando na porta ${PORT}`));
