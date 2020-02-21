import { dataTest } from "../support/utils";
import ManualSyncPageObject from "./common/ManualSyncPageObject";

class ManualEventSyncPageObject extends ManualSyncPageObject {
    constructor(cy) {
        super(cy, "event");
    }

    open() {
        super.open("/#/sync/events");
        return this;
    }

    selectOrgUnit(orgUnit) {
        this.cy.get(dataTest("DialogContent-events-synchronization")).selectInOrgUnitTree(orgUnit);
        return this;
    }
}

export default ManualEventSyncPageObject;
