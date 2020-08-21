import { dataTest } from "../utils";
import ManualSyncPageObject from "./common/ManualSyncPageObject";
import * as orgUnitStep from "../page-utils/orgUnitStep";
import * as periodStep from "../page-utils/periodStep";
import * as eventStep from "../page-utils/eventStep";

class ManualEventSyncPageObject extends ManualSyncPageObject {
    constructor(cy) {
        super(cy, "events");
    }

    open() {
        super.open("/#/sync/events");
        return this;
    }

    expandOrgUnit(orgUnit) {
        orgUnitStep.expandOrgUnit(dataTest(`DialogContent-${this.key}-synchronization`), orgUnit);
        return this;
    }

    selectOrgUnit(orgUnit) {
        orgUnitStep.selectOrgUnit(dataTest(`DialogContent-${this.key}-synchronization`), orgUnit);
        return this;
    }

    selectAllPeriods() {
        periodStep.selectAllPeriods();
        return this;
    }

    selectEvent(event) {
        eventStep.selectEvent(dataTest(`DialogContent-${this.key}-synchronization`), event);
        return this;
    }

    toggleAllEvents(value = true) {
        this.cy
            .get(dataTest("FormControlLabel-sync-all-events", "[type=checkbox]"))
            .should(value ? "not.be.checked" : "be.checked")
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
