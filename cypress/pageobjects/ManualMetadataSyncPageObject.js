import { dataTest } from "../support/utils";

class ManualMetadataSyncPageObject {
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
        return this.cy.get('[data-test="Button-metadata-synchronization-save"]');
    }

    open() {
        this.cy.login("admin");
        this.cy.visit("/#/sync/metadata");
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

    selectReceiverInstance(instance) {
        // Move to instance selection
        this.cy
            .get(dataTest("DialogContent-metadata-synchronization"))
            .contains("Instance Selection")
            .click();
        this.cy.waitForStep("Instance Selection");

        // Select receiver instance (multi-selector does not work fine with cypress?)
        this.cy.selectInMultiSelector(dataTest("DialogContent-metadata-synchronization"), instance);
        return this;
    }

    synchronize() {
        this.cy
            .route({
                method: "POST",
                url: "/api/metadata*",
            })
            .as("postMetadata");

        this.syncButton.click();
        this.cy.wait("@postMetadata");
        return this;
    }

    closeSyncResultsDialog() {
        this.cy.get('[data-test="Button-synchronization-results-save"]').click();
        return this;
    }
}

export default ManualMetadataSyncPageObject;
