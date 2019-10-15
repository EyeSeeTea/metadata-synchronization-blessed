import { dataTest } from "../support/utils";

context("Landing page", () => {
    beforeEach(() => {
        cy.login("admin");
        cy.visit("/#/");
    });

    it("renders a table with all pages of the application", () => {
        cy.get(dataTest("pages"))
            .should("have.length", 1)
            .should("be.visible");

        cy.contains("Instance Configuration");
        cy.contains("Metadata Synchronization");
        cy.contains("Data Synchronization");
        cy.contains("Metadata Synchronization Rules");
        cy.contains("Data Synchronization Rules");
        cy.contains("Synchronization History");
    });

    it("enters the Instance Configurator page", function() {
        cy.get(dataTest("page-instance-configurator")).click();
        cy.get(dataTest("page-header-title")).contains("Instance Configuration");
    });

    it("enters the Metadata Synchronization page", function() {
        cy.get(dataTest("page-sync/metadata")).click();
        cy.get(dataTest("page-header-title")).contains("Metadata Synchronization");
    });

    it("enters the Data Synchronization page", function() {
        cy.get(dataTest("page-sync/data")).click();
        cy.get(dataTest("page-header-title")).contains("Data Synchronization");
    });

    it("enter the MetadataSynchronization Rules page", function() {
        cy.get(dataTest("page-metadata-synchronization-rules")).click();
        cy.get(dataTest("page-header-title")).contains("Metadata Synchronization Rules");
    });

    it("enter the DataSynchronization Rules page", function() {
        cy.get(dataTest("page-data-synchronization-rules")).click();
        cy.get(dataTest("page-header-title")).contains("Data Synchronization Rules");
    });

    it("enter the Synchronization History page", function() {
        cy.get(dataTest("page-history")).click();
        cy.get(dataTest("page-header-title")).contains("Synchronization History");
    });
});
