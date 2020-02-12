import { dataTest } from "../support/utils";

context("Destination Settings", function() {
    beforeEach(() => {
        cy.login("admin");
        cy.visit("/#/instances");
        cy.get(dataTest("headerbar-title")).contains("MetaData Synchronization");
    });

    it("has the correct title", function() {
        cy.get(dataTest("page-header-title")).contains("Destination Instance Settings");
    });

    it("opens a new instance page", function() {
        cy.get(dataTest("objects-table-action-button")).click();
        cy.get(dataTest("page-header-title")).contains("New Instance");
    });
});
