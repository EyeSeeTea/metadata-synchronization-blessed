import * as eventStep from "../page-utils/eventStep";
import * as orgUnitStep from "../page-utils/orgUnitStep";
import * as periodStep from "../page-utils/periodStep";
import * as programStep from "../page-utils/programStep";
import { dataTest } from "../utils";
import SyncRuleDetailPageObject from "./common/SyncRuleDetailPageObject";

class EventSyncRuleDetailPageObject extends SyncRuleDetailPageObject {
    open(uid, stubApiResponseName) {
        if (uid) {
            super.open(`/#/sync-rules/events/edit/${uid}`);

            if (stubApiResponseName) {
                this.cy.wait(`@${stubApiResponseName}`);
            }
        } else {
            super.open("/#/sync-rules/events/new");
        }

        return this;
    }

    assertSelectedEvent(event) {
        eventStep.assertSelectedEvent(event);
        return this;
    }

    assertSelectedOrgUnit(assert) {
        orgUnitStep.assertSelectedOrgUnit(assert);
        return this;
    }

    assertSelectedProgramsCountMessage(assert) {
        programStep.assertSelectedProgramsCountMessage(assert);
        return this;
    }

    selectOrgUnit(orgUnit) {
        orgUnitStep.selectOrgUnit(".ou-root", orgUnit);
        return this;
    }

    expandOrgUnit(orgUnit) {
        orgUnitStep.expandOrgUnit(".ou-root", orgUnit);
        return this;
    }

    selectEvent(event) {
        eventStep.selectEvent(dataTest(`Paper`), event);
        return this;
    }

    toggleAllEvents(value = true) {
        this.cy
            .get(dataTest("FormControlLabel-sync-all-events", "[type=checkbox]"))
            .should(value ? "not.be.checked" : "be.checked")
            .click();
        return this;
    }

    selectAllPeriods() {
        periodStep.selectAllPeriods();
        return this;
    }

    checkOnlySelectedItems() {
        programStep.checkOnlySelectedItems();
        return this;
    }
}

export default EventSyncRuleDetailPageObject;
