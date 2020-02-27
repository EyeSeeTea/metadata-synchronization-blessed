import { dataTest } from "../../utils";
import PageObject from "./PageObject";

export default class ManualSyncPageObject extends PageObject {
    constructor(cy, key) {
        super(cy);
        this.key = key;
    }

    assertSyncResultsStatus(assert) {
        assert(this.cy.get('[data-test="Typography-synchronization-results-row-0"]'));
        return this;
    }

    assertSyncResultsSummary(assert) {
        assert(this.cy.get('[data-test="Table-synchronization-results-row-0"]'));
        return this;
    }

    assertSyncButton(assert) {
        assert(this.syncButton);
        return this;
    }

    get syncButton() {
        return this.cy.get(dataTest(`Button-${this.key}-synchronization-save`));
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
