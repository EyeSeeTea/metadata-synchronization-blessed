/// <reference types='Cypress' />

context("Landing page", () => {
    before(() => {
        cy.login("admin");
        cy.loadPage();
    });

    it("has page title", () => {
        cy.title().should("equal", "Metadata Synchronization");
    });

    it("shows 7 pages of the application", () => {
        cy.get('[data-test="pages"]')
            .should("have.length", 1)
            .should("be.visible");

        cy.contains("Instance Configurator");
        cy.contains("Organisation Units Sync");
        cy.contains("Data Elements Sync");
        cy.contains("Indicators Sync");
        cy.contains("Validation Rules Sync");
        cy.contains("Synchronization Rules");
        cy.contains("Notifications");
    });
});
