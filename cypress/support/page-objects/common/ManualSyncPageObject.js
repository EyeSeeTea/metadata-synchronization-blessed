import { dataTest } from "../../utils";

export default class ManualSyncPageObject {
    constructor(cy, key) {
        this.cy = cy;
        this.key = key;
    }

    assertTitle(assert) {
        assert(this.cy.get(dataTest("page-header-title")));
        return this;
    }

    assertError(assert) {
        assert(this.cy.get("#client-snackbar"));
        return this;
    }

    assertSyncResults(assert) {
        assert(this.cy.get('[data-test="Typography-synchronization-results-row-0"]'));
        return this;
    }

    assertSyncButton(assert) {
        assert(this.syncButton);
        return this;
    }

    get syncButton() {
        return this.cy.get(dataTest(`Button-${this.key}-synchronization-save`));
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
