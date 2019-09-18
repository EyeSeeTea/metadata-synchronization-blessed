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
        cy.contains("Organisation Units");
        cy.contains("Data Elements");
        cy.contains("Indicators");
        cy.contains("Validation Rules");
        cy.contains("Synchronization Rules");
        cy.contains("Synchronization History");
    });

    it("enters the Instance Configurator page", function() {
        cy.get(dataTest("page-instance-configurator")).click();
        cy.get(dataTest("page-header-title")).contains("Instance Configuration");
    });

    it("enters the Organisation Units Synchronization page", function() {
        cy.get(dataTest("page-sync/organisationUnits")).click();
        cy.get(dataTest("page-header-title")).contains("Organisation Units Synchronization");
    });

    it("enter the Data Elements Synchronization page", function() {
        cy.get(dataTest("page-sync/dataElements")).click();
        cy.get(dataTest("page-header-title")).contains("Data Elements Synchronization");
    });

    it("enter the Indicators Synchronization page", function() {
        cy.get(dataTest("page-sync/indicators")).click();
        cy.get(dataTest("page-header-title")).contains("Indicators Synchronization");
    });

    it("enter the Validation Rules Synchronization page", function() {
        cy.get(dataTest("page-sync/validationRules")).click();
        cy.get(dataTest("page-header-title")).contains("Validation Rules Synchronization");
    });

    it("enter the Synchronization Rules page", function() {
        cy.get(dataTest("page-synchronization-rules")).click();
        cy.get(dataTest("page-header-title")).contains("Synchronization Rules");
    });

    it("enter the Synchronization History page", function() {
        cy.get(dataTest("page-history")).click();
        cy.get(dataTest("page-header-title")).contains("Synchronization History");
    });
});
