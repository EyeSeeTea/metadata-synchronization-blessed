import { dataTest } from "../utils";

class ManualAggregatedSyncPageObject {
    constructor(cy) {
        this.cy = cy;
    }

    get title() {
        return this.cy.get(dataTest("page-header-title"));
    }

    get error() {
        return this.cy.get("#client-snackbar");
    }

    get syncResults() {
        return this.cy.get('[data-test="Typography-synchronization-results-row-0"]');
    }

    get syncButton() {
        return this.cy.get('[data-test="Button-aggregated-data-synchronization-save"]');
    }

    open() {
        this.cy.login("admin");
        this.cy.visit("/#/sync/aggregated");
        this.cy.get(dataTest("headerbar-title")).contains("MetaData Synchronization");
        return this;
    }

    search(text) {
        this.cy.get('[data-test="search"] > div > [aria-invalid="false"]').type(text);
        return this;
    }

    selectRow(text) {
        this.cy
            .get(dataTest("TableCell-data-table-row-0-column-displayname"))
            .contains(text)
            .click();
        return this;
    }

    openSyncDialog(text) {
        this.cy
            .get('[data-test="objects-table-action-button"] > :nth-child(1) > [focusable="false"]')
            .click();

        return this;
    }

    next() {
        this.cy.get('[data-test="Button-next-→"]').click();
        return this;
    }

    selectOrgUnit(orgUnit) {
        this.cy
            .get(dataTest("DialogContent-aggregated-data-synchronization"))
            .selectInOrgUnitTree(orgUnit);
        return this;
    }

    selectAllPeriods() {
        this.cy.get('[data-test="Select-period-dropdown-select"] > [tabindex="0"]').click();
        this.cy.get('[data-test="MenuItem-period-dropdown-select-element-fixed"]').click();
        this.cy.get('[data-test="Select-period-dropdown-select"] > [tabindex="0"]').click();
        this.cy.get('[data-test="MenuItem-period-dropdown-select-element-all"]').click();
        return this;
    }

    selectAllAttributesCategoryOptions() {
        this.cy
            .get(
                '[data-test="FormControlLabel-sync-all-attribute-category-options"] > :nth-child(2)'
            )
            .click();
        this.cy.get(dataTest("group-editor-assign-all")).click();
        return this;
    }

    selectReceiverInstance(instance) {
        // Move to instance selection
        this.cy
            .get(dataTest("DialogContent-aggregated-data-synchronization"))
            .contains("Instance Selection")
            .click();
        this.cy.waitForStep("Instance Selection");

        // Select receiver instance (multi-selector does not work fine with cypress?)
        this.cy.selectInMultiSelector(
            dataTest("DialogContent-aggregated-data-synchronization"),
            instance
        );
        return this;
    }

    synchronize() {
        this.cy
            .route({
                method: "POST",
                url: "/api/dataValueSets*",
            })
            .as("postDataValueSets");

        this.syncButton.click();
        this.cy.wait("@postDataValueSets");
        return this;
    }

    closeSyncResultsDialog() {
        this.cy.get('[data-test="Button-synchronization-results-save"]').click();
        return this;
    }
}

export default ManualAggregatedSyncPageObject;
