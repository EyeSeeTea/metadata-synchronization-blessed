import { dataTest } from "../../support/utils";

export default class ManualSyncPageObject {
    constructor(cy, key) {
        this.cy = cy;
        this.key = key;
    }

    get title() {
        return this.cy.get(dataTest("page-header-title"));
    }

    get error() {
        return this.cy.get("#client-snackbar");
    }

    get syncButton() {
        return this.cy.get(dataTest(`Button-${this.key}-synchronization-save`));
    }

    get syncResults() {
        return this.cy.get('[data-test="Typography-synchronization-results-row-0"]');
    }

    open(url) {
        this.cy.login("admin");
        this.cy.visit(url);
        this.cy.get(dataTest("headerbar-title")).contains("MetaData Synchronization");
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
        this.cy.selectInMultiSelector(
            dataTest(`DialogContent-${this.key}-synchronization`),
            instance
        );
        return this;
    }

    closeSyncResultsDialog() {
        this.cy.get('[data-test="Button-synchronization-results-save"]').click();
        return this;
    }
}
