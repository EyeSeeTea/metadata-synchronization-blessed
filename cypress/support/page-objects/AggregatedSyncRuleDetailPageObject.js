import { dataTest } from "../utils";
import SyncRuleDetailPageObject from "./common/SyncRuleDetailPageObject";
import * as orgUnitStep from "../page-utils/orgUnitStep";
import * as dataSetStep from "../page-utils/dataSetStep";
import * as periodStep from "../page-utils/periodStep";
import * as categoryOptionsStep from "../page-utils/categoryOptionsStep";

class AggregatedSyncRuleDetailPageObject extends SyncRuleDetailPageObject {
    constructor(cy) {
        super(cy);
    }

    open(uid) {
        if (uid) {
            super.open(`/#/sync-rules/aggregated/edit/${uid}`);
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
