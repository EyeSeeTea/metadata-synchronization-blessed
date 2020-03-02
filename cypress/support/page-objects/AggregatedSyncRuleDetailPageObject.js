import { dataTest } from "../utils";
import SyncRuleDetailPageObject from "./common/SyncRuleDetailPageObject";
import * as includeExcludeStep from "../page-utils/includeExcludeStep";

class AggregatedSyncRuleDetailPageObject extends SyncRuleDetailPageObject {
    constructor(cy) {
        super(cy, "metadata");
    }

    assertSelectedMetadata(assert) {
        assert(this.cy.contains("items selected in all pages"));
        return this;
    }

    open(uid) {
        if (uid) {
            super.open(`/#/sync-rules/aggregated/edit/${uid}`);
        } else {
            super.open("/#/sync-rules/aggregated/new");
        }

        this.getMetadataRouteName = includeExcludeStep.getMetadataRouteName();

        return this;
    }

    changeUseDefaultConfiguration() {
        includeExcludeStep.changeUseDefaultConfiguration(this.getMetadataRouteName);
        return this;
    }

    selectMetadataType(text) {
        includeExcludeStep.selectMetadataType("", text);
        return this;
    }

    excludeRule(rule) {
        includeExcludeStep.excludeRule("", rule);
        return this;
    }

    checkOnlySelectedItems() {
        this.cy
            .contains("Only selected items")
            .parent()
            .click();
        return this;
    }
}

export default AggregatedSyncRuleDetailPageObject;
