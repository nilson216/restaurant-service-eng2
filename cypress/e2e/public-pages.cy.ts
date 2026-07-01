describe("Páginas públicas", () => {
  it("exibe a tela de login com a identidade visual esperada", () => {
    cy.visit("/login");

    cy.get("[data-cy=login-page]").should("be.visible");
    cy.get("[data-cy=login-brand]").should("be.visible");
    cy.get('img[alt="Gerenciador de Serviços do Restaurante"]').should(
      "be.visible",
    );
    cy.contains("Univali Service").should("be.visible");
    cy.contains("Gerenciador de Serviço").should("be.visible");
  });

  it("exibe a página de cadastro com a identidade visual esperada", () => {
    cy.visit("/register", { failOnStatusCode: false });

    cy.get("[data-cy=register-page]").should("be.visible");
    cy.get("[data-cy=register-brand]").should("be.visible");
    cy.get('img[alt="MEC Donalds"]').should("be.visible");
    cy.contains("Univali Services").should("be.visible");
  });

  it("bloqueia o acesso à lista de restaurantes sem autenticação", () => {
    cy.request({
      url: "/restaurantes-cadastrados",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.include("This page could not be found.");
    });
  });

  it("bloqueia o acesso ao cadastro de restaurante sem autenticação", () => {
    cy.request({
      url: "/cadastrar-restaurante",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.include("This page could not be found.");
    });
  });
});
