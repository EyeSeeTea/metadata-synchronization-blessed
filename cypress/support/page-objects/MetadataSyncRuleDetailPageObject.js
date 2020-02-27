import { dataTest } from "../utils";
import SyncRuleDetailPageObject from "./common/SyncRuleDetailPageObject";

class MetadataSyncRuleDetailPageObject extends SyncRuleDetailPageObject {
    constructor(cy) {
        super(cy, "metadata");
    }

    assertSelectedMetadata(assert) {
        assert(this.cy.contains("Clear selection").prev("span"));
        return this;
    }

    assertSelectedInstances(assert) {
        assert(this.cy.get("select:last"));
        return this;
    }

    open(uid) {
        if (uid) {
            super.open(`/#/sync-rules/metadata/edit/${uid}`);
        } else {
            super.open("/#/sync-rules/metadata/new");
        }

        this.cy
            .route({
                method: "GET",
                url: "/api/metadata*",
            })
            .as("getMetadata");
        return this;
    }

    checkOnlySelectedItems() {
        this.cy
            .contains("Only selected items")
            .parent()
            .click();
        return this;
    }

    changeUseDefaultConfiguration() {
        this.cy.wait("@getMetadata");
        this.cy.get(".MuiSwitch-root").click();
        return this;
    }

    selectMetadataType(text) {
        this.cy
            .get(dataTest("DialogContent-metadata-synchronization"))
            .contains("Metadata type")
            .parent()
            .click();
        this.cy
            .get('[role="listbox"]')
            .contains(text)
            .click();
        return this;
    }

    excludeRule(rule) {
        this.cy.unselectInMultiSelector(dataTest(`DialogContent-metadata-synchronization`), rule);
        return this;
    }

    synchronize() {
        this.cy
            .route({
                method: "POST",
                url: "/api/metadata*",
            })
            .as("postMetadata");

        this.syncButton.click();
        this.cy.wait("@postMetadata");
        return this;
    }
}

export default MetadataSyncRuleDetailPageObject;
