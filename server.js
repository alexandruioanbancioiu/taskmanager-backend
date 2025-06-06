const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexiune la baza de date – înlocuiește cu datele tale reale de la InfinityFree
const db = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "taskmanager"
});

// Verificare conexiune
db.connect((err) => {
  if (err) {
    console.error("Eroare conexiune DB:", err);
    return;
  }
  console.log("✅ Conectat la baza de date MySQL");
});

// Autentificare
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error("Eroare la autentificare:", err);
      return res.status(500).json({ success: false });
    }

    if (results.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  });
});

// Adăugare task
app.post("/api/add-task", (req, res) => {
  const { titlu, descriere, prioritate, termen, status } = req.body;

  const sql = `
    INSERT INTO tasks (title, description, priority, deadline, status, user_id)
    VALUES (?, ?, ?, ?, ?, 1)
  `;

  db.query(sql, [titlu, descriere, prioritate, termen, status], (err, result) => {
    if (err) {
      console.error("Eroare la inserare:", err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});

// Obținere taskuri active
app.get("/api/tasks", (req, res) => {
  db.query("SELECT * FROM tasks WHERE status = 'activ' ORDER BY created_at DESC", (err, results) => {
    if (err) {
      console.error("Eroare la interogare:", err);
      return res.status(500).json({ error: "Eroare la interogare" });
    }
    res.json(results);
  });
});

// Ștergere task
app.delete("/api/delete-task/:id", (req, res) => {
  const taskId = req.params.id;

  db.query("DELETE FROM tasks WHERE id = ?", [taskId], (err, result) => {
    if (err) {
      console.error("Eroare la ștergerea taskului:", err);
      return res.status(500).json({ success: false });
    }
    res.json({ success: true });
  });
});

// Pornire server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Serverul rulează pe portul ${PORT}`);
});
