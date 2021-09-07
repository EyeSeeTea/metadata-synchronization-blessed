import { dataTest } from "../utils";
import ManualSyncPageObject from "./common/ManualSyncPageObject";
import * as includeExcludeStep from "../page-utils/includeExcludeStep";

class ManualMetadataSyncPageObject extends ManualSyncPageObject {
    constructor(cy) {
        super(cy, "metadata");
    }

    open() {
        super.open("/#/sync/metadata");
        this.getMetadataRouteName = includeExcludeStep.getMetadataRouteName();
        return this;
    }

    changeUseDefaultConfiguration() {
        includeExcludeStep.changeUseDefaultConfiguration(this.getMetadataRouteName);
        return this;
    }

    selectMetadataType(text) {
        includeExcludeStep.selectMetadataType(dataTest("DialogContent-metadata-synchronization"), text);
        return this;
    }

    selectFilterInTable(filterLabel, filterValue) {
        cy.selectFilterInTable(filterLabel, filterValue);
        return this;
    }

    excludeRule(rule) {
        includeExcludeStep.excludeRule(dataTest(`DialogContent-metadata-synchronization`), rule);
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

export default ManualMetadataSyncPageObject;
