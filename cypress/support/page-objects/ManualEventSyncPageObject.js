import { dataTest } from "../utils";
import ManualSyncPageObject from "./common/ManualSyncPageObject";

class ManualEventSyncPageObject extends ManualSyncPageObject {
    constructor(cy) {
        super(cy, "events");
    }

    open() {
        super.open("/#/sync/events");
        return this;
    }

    selectOrgUnit(orgUnit) {
        this.cy.get(dataTest("DialogContent-events-synchronization")).selectInOrgUnitTree(orgUnit);
        return this;
    }

    displayOrgUnitChildren(orgUnit) {
        this.cy
            .get(dataTest("DialogContent-events-synchronization"))
            .contains(orgUnit)
            .parent()
            .parent()
            .contains("▸")
            .click();
        return this;
    }

    selectEvent(event) {
        this.cy
            .get(dataTest("DialogContent-events-synchronization"))
            .contains(event)
            .parent()
            .click();
        return this;
    }

    selectAllPeriods() {
        this.cy.get('[data-test="Select-period-dropdown-select"] > [tabindex="0"]').click();
        this.cy.get('[data-test="MenuItem-period-dropdown-select-element-fixed"]').click();
        this.cy.get('[data-test="Select-period-dropdown-select"] > [tabindex="0"]').click();
        this.cy.get('[data-test="MenuItem-period-dropdown-select-element-all"]').click();
        return this;
    }

    synchronize() {
        this.cy
            .route({
                method: "POST",
                url: "/api/events*",
            })
            .as("postEvent");

        this.syncButton.click();
        this.cy.wait("@postEvent");
        return this;
    }
}

export default ManualEventSyncPageObject;
