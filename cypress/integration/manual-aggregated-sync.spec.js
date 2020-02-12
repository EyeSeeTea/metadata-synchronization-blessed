import { dataTest } from "../support/utils";

context("Manual aggregated sync", function() {
    beforeEach(() => {
        cy.login("admin");
        cy.visit("/#/sync/aggregated");
        cy.get(dataTest("headerbar-title")).contains("MetaData Synchronization");
    });

    it("has the correct title", function() {
        cy.get(dataTest("page-header-title")).contains("Aggregated Data Synchronization");
    });

    it("syncs correctly malaria annual data", function() {
        // Search in the search-box
        cy.get('[data-test="search"] > div > [aria-invalid="false"]').type("Malaria annual data");

        // Select one element from the table
        cy.get(dataTest("TableCell-data-table-row-0-column-displayname"))
            .contains("Malaria annual data")
            .click();

        // Open sync dialog
        cy.get(
            '[data-test="objects-table-action-button"] > :nth-child(1) > [focusable="false"]'
        ).click();

        // Select Ghana
        cy.get(dataTest("DialogContent-aggregated-data-synchronization"))
            .contains("Ghana")
            .dblclick();

        // Move to instance selection
        cy.get(dataTest("DialogContent-aggregated-data-synchronization"))
            .contains("Instance Selection")
            .click();

        cy.waitForStep("Instance Selection");

        // TODO: Select receiver instance (multi-selector does not work fine with cypress?)

        // Execute synchronization
        cy.contains("Synchronize").click();
    });
});
