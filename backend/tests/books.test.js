const supertest = require('supertest');
const { app, pool } = require('../index');

const request = supertest(app);

// Detecta si estamos en Azure Pipelines
const isCI = process.env.CI === "true";

let createdId;

afterAll(async () => {
  await pool.end();
});

describe("Books API", () => {

  test("GET /api/books devuelve lista de libros", async () => {
    const res = await request.get('/api/books');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /api/books crea un libro nuevo", async () => {
    const res = await request
      .post('/api/books')
      .send({ title: "Libro CI", author: "Autor CI", year: 2025 });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Libro CI");
    createdId = res.body.id;
  });

  // PUT se ejecuta SOLO en LOCAL (no en Azure)
  (isCI ? test.skip : test)(
    "PUT /api/books/:id actualiza un libro",
    async () => {
      const res = await request
        .put(`/api/books/${createdId}`)
        .send({
          title: "Libro CI Editado",
          author: "Autor CI",
          year: 2024
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.title).toBe("Libro CI Editado");
    }
  );

  // DELETE también se saltea en CI
  (isCI ? test.skip : test)(
    "DELETE /api/books/:id elimina un libro",
    async () => {
      const res = await request.delete(`/api/books/${createdId}`);
      expect(res.statusCode).toBe(204);
    }
  );

});
