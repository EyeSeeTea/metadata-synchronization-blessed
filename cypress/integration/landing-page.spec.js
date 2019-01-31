/// <reference types='Cypress' />

context("Landing page", () => {
    before(() => {
        cy.login("admin", "district");
        cy.loadPage();
    });

    it("has page title", () => {
        cy.title().should("equal", "React App");
    });

    it("shows feedback when button clicked", () => {
        cy.contains("Click to show feedback").click();
        cy.contains("Hello there");
    });
});
