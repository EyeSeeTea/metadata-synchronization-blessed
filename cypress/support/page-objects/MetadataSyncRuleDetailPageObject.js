import * as includeExcludeStep from "../page-utils/includeExcludeStep";
import SyncRuleDetailPageObject from "./common/SyncRuleDetailPageObject";

class MetadataSyncRuleDetailPageObject extends SyncRuleDetailPageObject {
    assertSelectedMetadata(assert) {
        assert(this.cy.contains("items selected in all pages"));
        return this;
    }

    open(uid) {
        if (uid) {
            super.open(`/#/sync-rules/metadata/edit/${uid}`);
        } else {
            super.open("/#/sync-rules/metadata/new");
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
            .route({
                method: "GET",
                url: "/api/dataElements*",
            })
            .as("getDataelements");

        this.cy
            .contains("Only selected items")
            .parent()
            .find("input")
            .click();

        this.cy.wait("@getDataelements");
        return this;
    }
}

export default MetadataSyncRuleDetailPageObject;
