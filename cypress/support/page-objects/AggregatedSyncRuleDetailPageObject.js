import { dataTest } from "../utils";
import SyncRuleDetailPageObject from "./common/SyncRuleDetailPageObject";
import * as orgUnitStep from "../page-utils/orgUnitStep";
import * as dataSetStep from "../page-utils/dataSetStep";

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

    checkOnlySelectedItems() {
        dataSetStep.checkOnlySelectedItems();
        return this;
    }
}

export default AggregatedSyncRuleDetailPageObject;
