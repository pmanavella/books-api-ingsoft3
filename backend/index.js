const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "pilar2004",
  database: "tp07_library",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.get("/api/books", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM books ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: "Error al obtener libros" });
  }
});

app.post("/api/books", async (req, res) => {
  try {
    const { title, author, year } = req.body;
    const [result] = await pool.query(
      "INSERT INTO books (title, author, year) VALUES (?, ?, ?)",
      [title, author, year]
    );
    const [rows] = await pool.query("SELECT * FROM books WHERE id = ?", [
      result.insertId
    ]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error al crear libro" });
  }
});

app.put("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, author, year } = req.body;
    await pool.query(
      "UPDATE books SET title = ?, author = ?, year = ? WHERE id = ?",
      [title, author, year, id]
    );
    const [rows] = await pool.query("SELECT * FROM books WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error al actualizar libro" });
  }
});

app.delete("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM books WHERE id = ?", [id]);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: "Error al eliminar libro" });
  }
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend escuchando en http://localhost:${PORT}`);
  });
}

module.exports = { app, pool };
