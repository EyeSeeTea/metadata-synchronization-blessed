import { dataTest } from "../support/utils";

context("Instance Configurator", function() {
    before(() => {
        cy.server();
        cy.fixture("app-config.json").then(json => cy.route("GET", "app-config.json", json));
    });

    beforeEach(() => {
        cy.login("admin");
        cy.visit("/#/instance-configurator");
    });

    it("has the correct title", function() {
        cy.get(dataTest("page-header-title")).contains("Instances");
    });

    it("opens a new instance page", function() {
        cy.get(dataTest("list-action-bar")).click();
        cy.get(dataTest("page-header-title")).contains("New Instance");
    });
});
