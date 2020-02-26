import { dataTest } from "../utils";
import SyncRulesPageObject from "./common/SyncRulesPageObject";

class MetadataSyncRulesPageObject extends SyncRulesPageObject {
    constructor(cy) {
        super(cy, "metadata");
    }

    open() {
        super.open("/#/sync-rules/metadata");
        this.cy
            .route({
                method: "GET",
                url: "/api/metadata*",
            })
            .as("getMetadata");
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

export default MetadataSyncRulesPageObject;
