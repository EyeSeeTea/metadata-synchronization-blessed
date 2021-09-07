import { dataTest } from "../support/utils";

context("Landing page", () => {
    beforeEach(() => {
        cy.login("admin");
        cy.visit("/#/");
        cy.get(dataTest("headerbar-title")).contains("MetaData Synchronization");
    });

    it("renders a table with all pages of the application", () => {
        cy.get(dataTest("div-landing")).should("have.length", 1).should("be.visible");

        cy.contains("Metadata Sync");
        cy.contains("Aggregated Data Sync");
        cy.contains("Events Sync");
        cy.contains("Configuration");

        cy.get(dataTest("div-landing-metadata")).contains("Manual sync");
        cy.get(dataTest("div-landing-metadata")).contains("Sync rules");
        cy.get(dataTest("div-landing-metadata")).contains("History");

        cy.get(dataTest("div-landing-aggregated")).contains("Manual sync");
        cy.get(dataTest("div-landing-aggregated")).contains("Sync rules");
        cy.get(dataTest("div-landing-aggregated")).contains("History");

        cy.get(dataTest("div-landing-events")).contains("Manual sync");
        cy.get(dataTest("div-landing-events")).contains("Sync rules");
        cy.get(dataTest("div-landing-events")).contains("History");

        cy.get(dataTest("div-landing-configuration")).contains("Instance settings");
    });

    // Metadata
    it("enters the Metadata manual sync page", function () {
        cy.get(dataTest("Card-landing-metadata-manual-sync", "button[title='List']")).click();
        cy.get(dataTest("page-header-title")).contains("Metadata Synchronization");
    });

    it("enters the Metadata sync rules page", function () {
        cy.get(dataTest("Card-landing-metadata-sync-rules", "button[title='List']")).click();
        cy.get(dataTest("page-header-title")).contains("Metadata Synchronization Rules");
    });

    it("enters the Metadata sync rules page", function () {
        cy.get(dataTest("Card-landing-metadata-sync-rules", "button[title='Add']")).click();
        cy.get(dataTest("page-header-title")).contains("New metadata synchronization rule");
    });

    it("enters the Metadata history page", function () {
        cy.get(dataTest("Card-landing-metadata-history", "button[title='List']")).click();
        cy.get(dataTest("page-header-title")).contains("Metadata Synchronization History");
    });

    // Aggregated Data
    it("enters the Aggregated Data manual sync page", function () {
        cy.get(dataTest("Card-landing-aggregated-manual-sync", "button[title='List']")).click();
        cy.get(dataTest("page-header-title")).contains("Aggregated Data Synchronization");
    });

    it("enters the Aggregated Data sync rules page", function () {
        cy.get(dataTest("Card-landing-aggregated-sync-rules", "button[title='List']")).click();
        cy.get(dataTest("page-header-title")).contains("Aggregated Data Synchronization Rules");
    });

    it("enters the Aggregated Data sync rules page", function () {
        cy.get(dataTest("Card-landing-aggregated-sync-rules", "button[title='Add']")).click();
        cy.get(dataTest("page-header-title")).contains("New aggregated synchronization rule");
    });

    it("enters the Aggregated Data history page", function () {
        cy.get(dataTest("Card-landing-aggregated-history", "button[title='List']")).click();
        cy.get(dataTest("page-header-title")).contains("Aggregated Data Synchronization History");
    });

    // Events
    it("enters the Events manual sync page", function () {
        cy.get(dataTest("Card-landing-events-manual-sync", "button[title='List']")).click();
        cy.get(dataTest("page-header-title")).contains("Events Synchronization");
    });

    it("enters the Events sync rules page", function () {
        cy.get(dataTest("Card-landing-events-sync-rules", "button[title='List']")).click();
        cy.get(dataTest("page-header-title")).contains("Events Synchronization Rules");
    });

    it("enters the Aggregated Data sync rules page", function () {
        cy.get(dataTest("Card-landing-events-sync-rules", "button[title='Add']")).click();
        cy.get(dataTest("page-header-title")).contains("New events synchronization rule");
    });

    it("enters the Aggregated Data history page", function () {
        cy.get(dataTest("Card-landing-events-history", "button[title='List']")).click();
        cy.get(dataTest("page-header-title")).contains("Events Synchronization History");
    });

    // Instance Settings
    it("enters the instance settings page", function () {
        cy.get(dataTest("Card-landing-configuration-destination-instance-settings", "button[title='List']")).click();
        cy.get(dataTest("page-header-title")).contains("Instance Settings");
    });

    it("enters the Destination instance creation page", function () {
        cy.get(dataTest("Card-landing-configuration-destination-instance-settings", "button[title='Add']")).click();
        cy.get(dataTest("page-header-title")).contains("New Instance");
    });
});
