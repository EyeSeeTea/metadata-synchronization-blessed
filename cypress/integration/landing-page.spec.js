import { dataTest } from "../support/utils";

context("Landing page", () => {
    before(() => {
        cy.server();
        cy.fixture("app-config.json").then(json => cy.route("GET", "app-config.json", json));
    });

    beforeEach(() => {
        cy.login("admin");
        cy.visit("/");
    });

    it("renders a table with all pages of the application", () => {
        cy.get(dataTest("pages"))
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

    it("enters the Instance Configurator page", function() {
        cy.get(dataTest("page-instance-configurator")).click();
        cy.get(dataTest("page-header-title")).contains("Instances");
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
});
