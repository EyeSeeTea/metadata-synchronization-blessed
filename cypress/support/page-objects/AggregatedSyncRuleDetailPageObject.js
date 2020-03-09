import * as categoryOptionsStep from "../page-utils/categoryOptionsStep";
import * as dataSetStep from "../page-utils/dataSetStep";
import * as orgUnitStep from "../page-utils/orgUnitStep";
import * as periodStep from "../page-utils/periodStep";
import SyncRuleDetailPageObject from "./common/SyncRuleDetailPageObject";

class AggregatedSyncRuleDetailPageObject extends SyncRuleDetailPageObject {
    open(uid, stubApiResponseName) {
        if (uid) {
            super.open(`/#/sync-rules/aggregated/edit/${uid}`);

            if (stubApiResponseName) {
                this.cy.wait(`@${stubApiResponseName}`);
            }
        } else {
            super.open("/#/sync-rules/aggregated/new");
        }

        return this;
    }

    assertSelectedOrgUnit(assert) {
        orgUnitStep.assertSelectedOrgUnit(assert);
        return this;
    }

    assertSelectedDatasetCountMessage(assert) {
        dataSetStep.assertSelectedDatasetCountMessage(assert);
        return this;
    }

    selectOrgUnit(orgUnit) {
        orgUnitStep.selectOrgUnit(".ou-root", orgUnit);
        return this;
    }

    selectAllPeriods() {
        periodStep.selectAllPeriods();
        return this;
    }

    selectAllAttributesCategoryOptions() {
        categoryOptionsStep.selectAllAttributesCategoryOptions();
        return this;
    }

    checkOnlySelectedItems() {
        dataSetStep.checkOnlySelectedItems();
        return this;
    }
}

export default AggregatedSyncRuleDetailPageObject;
