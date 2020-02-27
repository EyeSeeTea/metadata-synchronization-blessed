import { dataTest } from "../utils";
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

    selectOrgUnitLevel(orgUnitLevel) {
        this.cy
            .get(
                '[style="margin-bottom: -24px; margin-top: 0px;"] > [style="position: relative; min-height: 89px;"] > .MuiFormControl-root > .MuiInputBase-root > .MuiSelect-root'
            )
            .click();
        this.cy.get('[data-value="5"]').click();

        this.cy
            .get(
                '[style="margin-bottom: -24px; margin-top: 0px;"] > [style="position: relative; min-height: 89px;"] > [style="position: absolute; display: inline-block; top: 24px; margin-left: 16px;"] > [style="position: relative; top: 3px; margin-left: 0px;"] > .MuiButton-label'
            )
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
}

export default ManualEventSyncPageObject;
