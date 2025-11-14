describe("Gestor de Libros - E2E", () => {
    const baseUrl = "http://localhost:5173";
  
    beforeEach(() => {
      cy.visit(baseUrl);
    });
  
    it("muestra la lista inicial de libros", () => {
      cy.contains("Gestor de Libros").should("be.visible");
      cy.contains("Clean Code").should("exist");
    });
  
    it("permite agregar un libro nuevo", () => {
      cy.get('input[name="title"]').type("Libro E2E");
      cy.get('input[name="author"]').type("Autor E2E");
      cy.get('input[name="year"]').type("2024");
      cy.contains("button", "Agregar libro").click();
  
      cy.contains("Libro E2E").should("be.visible");
      cy.contains("Autor E2E").should("be.visible");
    });
  
    it("permite editar y borrar un libro", () => {
      cy.get('input[name="title"]').type("Libro Cypress");
      cy.get('input[name="author"]').type("Autor Cypress");
      cy.get('input[name="year"]').type("2025");
      cy.contains("button", "Agregar libro").click();
  
      cy.contains("Libro Cypress")
        .parent("div, tr")
        .within(() => cy.contains("Editar").click());
  
      cy.get('input[name="title"]').clear().type("Libro Editado");
      cy.contains("button", "Guardar cambios").click();
  
      cy.contains("Libro Editado").should("be.visible");
  
      cy.contains("Libro Editado")
        .parent("div, tr")
        .within(() => cy.contains("Borrar").click());
  
      cy.on("window:confirm", () => true);
  
      cy.contains("Libro Editado").should("not.exist");
    });
  });
  