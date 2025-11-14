import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import App from "../App";

describe("Gestor de Libros - App", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("muestra el título principal", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => []
    });

    render(<App />);

    expect(
      screen.getByRole("heading", { name: /gestor de libros/i })
    ).toBeInTheDocument();
  });

  test("carga y muestra libros obtenidos desde la API", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [
        { id: 1, title: "Clean Code", author: "Robert C. Martin", year: 2008 }
      ]
    });

    render(<App />);

    await waitFor(() =>
      expect(screen.getByText("Clean Code")).toBeInTheDocument()
    );
    expect(screen.getByText("Robert C. Martin")).toBeInTheDocument();
    expect(screen.getByText("2008")).toBeInTheDocument();
  });

  test("permite agregar un libro nuevo desde el formulario", async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => []
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 2,
          title: "Libro de prueba",
          author: "Autor de prueba",
          year: 2024
        })
      });

    render(<App />);

    const inputTitulo = screen.getByLabelText(/título/i);
    const inputAutor = screen.getByLabelText(/autor/i);
    const inputAnio = screen.getByLabelText(/año/i);
    const botonAgregar = screen.getByRole("button", { name: /agregar libro/i });

    fireEvent.change(inputTitulo, { target: { value: "Libro de prueba" } });
    fireEvent.change(inputAutor, { target: { value: "Autor de prueba" } });
    fireEvent.change(inputAnio, { target: { value: "2024" } });

    fireEvent.click(botonAgregar);

    await waitFor(() =>
      expect(screen.getByText("Libro de prueba")).toBeInTheDocument()
    );
    expect(screen.getByText("Autor de prueba")).toBeInTheDocument();
    expect(screen.getByText("2024")).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
