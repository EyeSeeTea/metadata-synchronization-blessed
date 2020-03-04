import PageObject from "./PageObject";

export default class SyncRuleListPageObject extends PageObject {
    assertRowsCount(expectedRowsCount) {
        this.cy
            .get("table>tbody")
            .find("tr")
            .should("have.length", expectedRowsCount);
        return this;
    }

    openActionsMenu(rowIndex) {
        this.cy
            .get("table>tbody")
            .find("tr")
            .eq(rowIndex)
            .within(() => {
                this.cy
                    .get("td")
                    .eq(6)
                    .click();
            });

        return this;
    }

    assertSyncResultsStatus(assert) {
        assert(this.cy.get('[data-test="Typography-synchronization-results-row-0"]'));
        return this;
    }
}
