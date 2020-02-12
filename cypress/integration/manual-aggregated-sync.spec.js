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

    /**
     * Database: d2-docker-eyeseetea-2-30-datasync-sender
     */
    it("syncs correctly malaria annual data", function() {
        cy.get('[data-test="search"] > div > [aria-invalid="false"]').type("Malaria annual data");
        cy.get(dataTest("TableCell-data-table-row-0-column-displayname")).contains(
            "Malaria annual data"
        );
        cy.get(dataTest("Checkbox-data-table-row-0")).click();
        cy.get(
            '[data-test="objects-table-action-button"] > :nth-child(1) > [focusable="false"]'
        ).click();
    });
});
