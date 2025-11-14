require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  const env = process.env.NODE_ENV || "local";
  res.send(`Backend funcionando - ${env.toUpperCase()}`);
});

async function getAllBooks(req, res) {
  try {
    const [rows] = await db.query("SELECT * FROM books");
    res.json(rows);
  } catch (err) {
    console.error("Error al obtener libros:", err);
    res.status(500).json({ message: "Error al obtener libros" });
  }
}

async function createBook(req, res) {
  try {
    const { title, author, year } = req.body;

    if (!title || !author || !year) {
      return res.status(400).json({ message: "Faltan datos del libro" });
    }

    const [result] = await db.query(
      "INSERT INTO books (title, author, year) VALUES (?, ?, ?)",
      [title, author, year]
    );

    res.status(201).json({
      id: result.insertId,
      title,
      author,
      year,
    });
  } catch (err) {
    console.error("Error al crear libro:", err);
    res.status(500).json({ message: "Error al crear libro" });
  }
}

async function deleteBook(req, res) {
  try {
    const { id } = req.params;

    const [result] = await db.query("DELETE FROM books WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Libro no encontrado" });
    }

    res.status(204).end();
  } catch (err) {
    console.error("Error al eliminar libro:", err);
    res.status(500).json({ message: "Error al eliminar libro" });
  }
}

const routes = ["/books", "/api/books"];

routes.forEach((base) => {
  app.get(base, getAllBooks);
  app.post(base, createBook);
  app.delete(`${base}/:id`, deleteBook);
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Backend escuchando en http://0.0.0.0:${PORT}`);
  });
}

module.exports = app;
