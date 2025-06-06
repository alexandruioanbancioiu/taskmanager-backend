const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "taskmanager"
});

db.connect((err) => {
  if (err) {
    console.error("Eroare conexiune:", err);
    return;
  }
  console.log("Conectat la baza de date MySQL");
});

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

app.get("/api/tasks", (req, res) => {
  db.query("SELECT * FROM tasks WHERE status = 'activ' ORDER BY created_at DESC", (err, results) => {
    if (err) {
      console.error("Eroare la interogare:", err);
      return res.status(500).json({ error: "Eroare la interogare" });
    }
    res.json(results);
  });
});

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

app.listen(3001, () => {
  console.log("Serverul rulează pe http://localhost:3001");
});
