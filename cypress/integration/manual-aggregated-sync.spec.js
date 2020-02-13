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
        cy.route({
            method: "POST",
            url: "/api/dataValueSets*",
        }).as("postDataValueSets");

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
        cy.get(dataTest("DialogContent-aggregated-data-synchronization")).selectInOrgUnitTree(
            "Ghana"
        );
        cy.get('[data-test="Button-next-→"]').click();

        // Select all periods
        cy.get('[data-test="Select-period-dropdown-select"] > [tabindex="0"]').click();
        cy.get('[data-test="MenuItem-period-dropdown-select-element-fixed"]').click();
        cy.get('[data-test="Select-period-dropdown-select"] > [tabindex="0"]').click();
        cy.get('[data-test="MenuItem-period-dropdown-select-element-all"]').click();
        cy.get('[data-test="Button-next-→"]').click();

        // Select all attributes
        cy.get(
            '[data-test="FormControlLabel-sync-all-attribute-category-options"] > :nth-child(2)'
        ).click();
        cy.get(dataTest("group-editor-assign-all")).click();
        cy.get('[data-test="Button-next-→"]').click();

        // Move to instance selection
        cy.get(dataTest("DialogContent-aggregated-data-synchronization"))
            .contains("Instance Selection")
            .click();
        cy.waitForStep("Instance Selection");

        // Select receiver instance (multi-selector does not work fine with cypress?)
        cy.selectInMultiSelector(
            dataTest("DialogContent-aggregated-data-synchronization"),
            "kiNVCEtS8Cl"
        );

        // Execute synchronization and assert dialog appears
        cy.contains("Synchronize").click();
        cy.wait("@postDataValueSets");
        cy.get('[data-test="DialogTitle-synchronization-results"]').contains(
            "Synchronization Results"
        );
        cy.get('[data-test="Button-synchronization-results-save"]').click();
    });
});
