/// <reference types='Cypress' />

context("Landing page", () => {
    before(() => {
        cy.login("admin");
        cy.loadPage();
    });

    it("has page title", () => {
        cy.title().should("equal", "Metadata Synchronization");
    });

    it("shows feedback when button clicked", () => {
        cy.contains("Click to show feedback").click();
        cy.contains("Hello there");
    });
});
