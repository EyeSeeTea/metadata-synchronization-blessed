import { dataTest } from "../utils";
import ManualSyncPageObject from "./common/ManualSyncPageObject";
import * as selectOrgUnitStep from "../page-utils/selectOrgUnitStep";
import * as selectPeriodStep from "../page-utils/selectPeriodStep";

class ManualEventSyncPageObject extends ManualSyncPageObject {
    constructor(cy) {
        super(cy, "events");
    }

    open() {
        super.open("/#/sync/events");
        return this;
    }

    expandOrgUnit(orgUnit) {
        this.cy.expandInOrgUnitTree(dataTest(`DialogContent-${this.key}-synchronization`), orgUnit);
        return this;
    }

    selectOrgUnit(orgUnit) {
        selectOrgUnitStep.selectOrgUnit(dataTest(`DialogContent-${this.key}-synchronization`), orgUnit);
        return this;
    }

    selectAllPeriods() {
        selectPeriodStep.selectAllPeriods();
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
