import { useEffect, useState } from "react";

const API_URL = "http://localhost:4000/api/books";

function App() {
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState({ id: null, title: "", author: "", year: "" });
  const [loading, setLoading] = useState(false);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setBooks(data);
    } catch {
      alert("Error al cargar libros");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBooks();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.author || !form.year) return;

    const payload = {
      title: form.title,
      author: form.author,
      year: Number(form.year)
    };

    try {
      if (form.id === null) {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const newBook = await res.json();
        setBooks((prev) => [newBook, ...prev]);
      } else {
        const res = await fetch(`${API_URL}/${form.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const updated = await res.json();
        setBooks((prev) =>
          prev.map((b) => (b.id === updated.id ? updated : b))
        );
      }

      setForm({ id: null, title: "", author: "", year: "" });
    } catch {
      alert("Error al guardar libro");
    }
  };

  const handleEdit = (book) => {
    setForm({
      id: book.id,
      title: book.title,
      author: book.author,
      year: book.year.toString()
    });
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este libro?")) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      alert("Error al eliminar libro");
    }
  };

  const handleCancel = () => {
    setForm({ id: null, title: "", author: "", year: "" });
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "2rem",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}
    >
      <h1 style={{ marginBottom: "1rem" }}>Gestor de Libros</h1>

      <form
  onSubmit={handleSubmit}
  style={{
    marginBottom: "2rem",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 120px",
    gap: "0.75rem",
    alignItems: "end"
  }}
>
  <div>
    <label
      htmlFor="title"
      style={{ display: "block", marginBottom: "0.25rem" }}
    >
      Título
    </label>
    <input
      id="title"
      name="title"
      value={form.title}
      onChange={handleChange}
      style={{ width: "100%", padding: "0.5rem" }}
    />
  </div>

  <div>
    <label
      htmlFor="author"
      style={{ display: "block", marginBottom: "0.25rem" }}
    >
      Autor
    </label>
    <input
      id="author"
      name="author"
      value={form.author}
      onChange={handleChange}
      style={{ width: "100%", padding: "0.5rem" }}
    />
  </div>

  <div>
    <label
      htmlFor="year"
      style={{ display: "block", marginBottom: "0.25rem" }}
    >
      Año
    </label>
    <input
      id="year"
      name="year"
      type="number"
      value={form.year}
      onChange={handleChange}
      style={{ width: "100%", padding: "0.5rem" }}
    />
  </div>

        <div style={{ gridColumn: "1 / -1", display: "flex", gap: "0.5rem" }}>
          <button
            type="submit"
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              cursor: "pointer",
              backgroundColor: "#2563eb",
              color: "white"
            }}
          >
            {form.id === null ? "Agregar libro" : "Guardar cambios"}
          </button>
          {form.id !== null && (
            <button
              type="button"
              onClick={handleCancel}
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #ccc",
                cursor: "pointer",
                backgroundColor: "white"
              }}
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "0.75rem",
          overflow: "hidden"
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "60px 2fr 2fr 100px 160px",
            padding: "0.75rem",
            backgroundColor: "#f9fafb",
            fontWeight: 600
          }}
        >
          <div>ID</div>
          <div>Título</div>
          <div>Autor</div>
          <div>Año</div>
          <div>Acciones</div>
        </div>
        {loading ? (
          <div style={{ padding: "0.75rem" }}>Cargando...</div>
        ) : books.length === 0 ? (
          <div style={{ padding: "0.75rem" }}>No hay libros cargados.</div>
        ) : (
          books.map((book) => (
            <div
              key={book.id}
              style={{
                display: "grid",
                gridTemplateColumns: "60px 2fr 2fr 100px 160px",
                padding: "0.75rem",
                borderTop: "1px solid #e5e7eb",
                alignItems: "center"
              }}
            >
              <div>{book.id}</div>
              <div>{book.title}</div>
              <div>{book.author}</div>
              <div>{book.year}</div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => handleEdit(book)}
                  style={{
                    padding: "0.25rem 0.75rem",
                    border: "1px solid #e5e7eb",
                    cursor: "pointer",
                    backgroundColor: "white"
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(book.id)}
                  style={{
                    padding: "0.25rem 0.75rem",
                    border: "1px solid #fee2e2",
                    cursor: "pointer",
                    backgroundColor: "#fee2e2"
                  }}
                >
                  Borrar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
