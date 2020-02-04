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

        cy.contains("Metadata Sync");
        cy.contains("Aggregated Data Sync");
        cy.contains("Events Sync");
        cy.contains("Configuration");

        cy.get(dataTest("metadata")).contains("Manual sync");
        cy.get(dataTest("metadata")).contains("Sync rules");
        cy.get(dataTest("metadata")).contains("History");

        cy.get(dataTest("aggregated")).contains("Manual sync");
        cy.get(dataTest("aggregated")).contains("Sync rules");
        cy.get(dataTest("aggregated")).contains("History");

        cy.get(dataTest("events")).contains("Manual sync");
        cy.get(dataTest("events")).contains("Sync rules");
        cy.get(dataTest("events")).contains("History");

        cy.get(dataTest("configuration")).contains("Destination instance settings");
    });

    // Metadata
    it("enters the Metadata manual sync page", function() {
        cy.get("[data-test='card-metadata-0'] button[title='List']").click();
        cy.get(dataTest("page-header-title")).contains("Metadata Synchronization");
    });

    it("enters the Metadata sync rules page", function() {
        cy.get("[data-test='card-metadata-1'] button[title='List']").click();
        cy.get(dataTest("page-header-title")).contains("Metadata Synchronization Rules");
    });

    it("enters the Metadata sync rules page", function() {
        cy.get("[data-test='card-metadata-1'] button[title='Add']").click();
        cy.get(dataTest("page-header-title")).contains("New metadata synchronization rule");
    });

    it("enters the Metadata history page", function() {
        cy.get("[data-test='card-metadata-2'] button[title='List']").click();
        cy.get(dataTest("page-header-title")).contains("Metadata Synchronization History");
    });

    // Aggregated Data
    it("enters the Aggregated Data manual sync page", function() {
        cy.get("[data-test='card-aggregated-0'] button[title='List']").click();
        cy.get(dataTest("page-header-title")).contains("Aggregated Data Synchronization");
    });

    it("enters the Aggregated Data sync rules page", function() {
        cy.get("[data-test='card-aggregated-1'] button[title='List']").click();
        cy.get(dataTest("page-header-title")).contains("Aggregated Data Synchronization Rules");
    });

    it("enters the Aggregated Data sync rules page", function() {
        cy.get("[data-test='card-aggregated-1'] button[title='Add']").click();
        cy.get(dataTest("page-header-title")).contains("New aggregated synchronization rule");
    });

    it("enters the Aggregated Data history page", function() {
        cy.get("[data-test='card-aggregated-2'] button[title='List']").click();
        cy.get(dataTest("page-header-title")).contains("Aggregated Data Synchronization History");
    });

    // Events
    it("enters the Events manual sync page", function() {
        cy.get("[data-test='card-events-0'] button[title='List']").click();
        cy.get(dataTest("page-header-title")).contains("Events Synchronization");
    });

    it("enters the Events sync rules page", function() {
        cy.get("[data-test='card-events-1'] button[title='List']").click();
        cy.get(dataTest("page-header-title")).contains("Events Synchronization Rules");
    });

    it("enters the Aggregated Data sync rules page", function() {
        cy.get("[data-test='card-events-1'] button[title='Add']").click();
        cy.get(dataTest("page-header-title")).contains("New events synchronization rule");
    });

    it("enters the Aggregated Data history page", function() {
        cy.get("[data-test='card-events-2'] button[title='List']").click();
        cy.get(dataTest("page-header-title")).contains("Events Synchronization History");
    });

    // Instance Settings
    it("enters the Destination instance settings page", function() {
        cy.get("[data-test='card-configuration-0'] button[title='List']").click();
        cy.get(dataTest("page-header-title")).contains("Destination Instance Settings");
    });

    it("enters the Destination instance creation page", function() {
        cy.get("[data-test='card-configuration-0'] button[title='Add']").click();
        cy.get(dataTest("page-header-title")).contains("New Instance");
    });

    it("enters the Destination instance settings page", function() {
        cy.get("[data-test='card-configuration-1'] button[title='List']").click();
        cy.get(dataTest("page-header-title")).contains("Metadata mapping");
    });
});
