const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

require("dotenv").config();

const app = express();

// Puerto dinámico (Render asigna PORT)
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Config DB desde variables de entorno
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ----------- RUTAS API -----------------

app.get("/api/books", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM books ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("Error /api/books GET:", err);
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
    console.error("Error /api/books POST:", err);
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
    console.error("Error /api/books PUT:", err);
    res.status(500).json({ message: "Error al actualizar libro" });
  }
});

app.delete("/api/books/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM books WHERE id = ?", [id]);
    res.status(204).end();
  } catch (err) {
    console.error("Error /api/books DELETE:", err);
    res.status(500).json({ message: "Error al eliminar libro" });
  }
});

// ----------- SERVIDOR -----------------

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Backend escuchando en http://0.0.0.0:${PORT}`);
  });
}

module.exports = { app, pool };
