import { dataTest } from "../support/utils";
import ManualSyncPageObject from "./common/ManualSyncPageObject";

class ManualMetadataSyncPageObject extends ManualSyncPageObject {
    constructor(cy) {
        super(cy, "metadata");
    }

    open() {
        super.open("/#/sync/metadata");
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
