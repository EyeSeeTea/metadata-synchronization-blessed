import { dataTest } from "../support/utils";

context("Landing page", () => {
    beforeEach(() => {
        cy.login("admin");
        cy.visit("/#/");
    });

    it("renders a table with all pages of the application", () => {
        cy.get(dataTest("div-pages"))
            .should("have.length", 1)
            .should("be.visible");

        cy.contains("Metadata Sync");
        cy.contains("Aggregated Data Sync");
        cy.contains("Events Sync");
        cy.contains("Configuration");

        cy.get(dataTest("div-pages-metadata")).contains("Manual sync");
        cy.get(dataTest("div-pages-metadata")).contains("Sync rules");
        cy.get(dataTest("div-pages-metadata")).contains("History");

        cy.get(dataTest("div-pages-aggregated")).contains("Manual sync");
        cy.get(dataTest("div-pages-aggregated")).contains("Sync rules");
        cy.get(dataTest("div-pages-aggregated")).contains("History");

        cy.get(dataTest("div-pages-events")).contains("Manual sync");
        cy.get(dataTest("div-pages-events")).contains("Sync rules");
        cy.get(dataTest("div-pages-events")).contains("History");

        cy.get(dataTest("div-pages-configuration")).contains("Destination instance settings");
    });

    // Metadata
    it("enters the Metadata manual sync page", function() {
        cy.get(dataTest("MenuCard-metadata-manual-sync", "button[title='List']")).click();
        cy.get(dataTest("page-header-title")).contains("Metadata Synchronization");
    });

    it("enters the Metadata sync rules page", function() {
        cy.get(dataTest("MenuCard-metadata-sync-rules", "button[title='List']")).click();
        cy.get(dataTest("page-header-title")).contains("Metadata Synchronization Rules");
    });

    it("enters the Metadata sync rules page", function() {
        cy.get(dataTest("MenuCard-metadata-sync-rules", "button[title='Add']")).click();
        cy.get(dataTest("page-header-title")).contains("New metadata synchronization rule");
    });

    it("enters the Metadata history page", function() {
        cy.get(dataTest("MenuCard-metadata-history", "button[title='List']")).click();
        cy.get(dataTest("page-header-title")).contains("Metadata Synchronization History");
    });

    // Aggregated Data
    it("enters the Aggregated Data manual sync page", function() {
        cy.get(dataTest("MenuCard-aggregated-manual-sync", "button[title='List']")).click();
        cy.get(dataTest("page-header-title")).contains("Aggregated Data Synchronization");
    });

    it("enters the Aggregated Data sync rules page", function() {
        cy.get(dataTest("MenuCard-aggregated-sync-rules", "button[title='List']")).click();
        cy.get(dataTest("page-header-title")).contains("Aggregated Data Synchronization Rules");
    });

    it("enters the Aggregated Data sync rules page", function() {
        cy.get(dataTest("MenuCard-aggregated-sync-rules", "button[title='Add']")).click();
        cy.get(dataTest("page-header-title")).contains("New aggregated synchronization rule");
    });

    it("enters the Aggregated Data history page", function() {
        cy.get(dataTest("MenuCard-aggregated-history", "button[title='List']")).click();
        cy.get(dataTest("page-header-title")).contains("Aggregated Data Synchronization History");
    });

    // Events
    it("enters the Events manual sync page", function() {
        cy.get(dataTest("MenuCard-events-manual-sync", "button[title='List']")).click();
        cy.get(dataTest("page-header-title")).contains("Events Synchronization");
    });

    it("enters the Events sync rules page", function() {
        cy.get(dataTest("MenuCard-events-sync-rules", "button[title='List']")).click();
        cy.get(dataTest("page-header-title")).contains("Events Synchronization Rules");
    });

    it("enters the Aggregated Data sync rules page", function() {
        cy.get(dataTest("MenuCard-events-sync-rules", "button[title='Add']")).click();
        cy.get(dataTest("page-header-title")).contains("New events synchronization rule");
    });

    it("enters the Aggregated Data history page", function() {
        cy.get(dataTest("MenuCard-events-history", "button[title='List']")).click();
        cy.get(dataTest("page-header-title")).contains("Events Synchronization History");
    });

    // Instance Settings
    it("enters the Destination instance settings page", function() {
        cy.get(
            dataTest("MenuCard-configuration-destination-instance-settings", "button[title='List']")
        ).click();
        cy.get(dataTest("page-header-title")).contains("Destination Instance Settings");
    });

    it("enters the Destination instance creation page", function() {
        cy.get(
            dataTest("MenuCard-configuration-destination-instance-settings", "button[title='Add']")
        ).click();
        cy.get(dataTest("page-header-title")).contains("New Instance");
    });
});
