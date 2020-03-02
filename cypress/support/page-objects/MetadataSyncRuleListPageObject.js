import SyncRuleListPageObject from "./common/SyncRuleListPageObject";

class MetadataSyncRuleListPageObject extends SyncRuleListPageObject {
    open(stubApiResponseName) {
        super.open("/#/sync-rules/metadata");

        this.cy.wait(`@${stubApiResponseName}`);

        return this;
    }

    synchronize() {
        this.cy
            .route({
                method: "POST",
                url: "/api/metadata*",
            })
            .as("postMetadata");

        this.cy.contains("Execute").click();
        this.cy.wait("@postMetadata");
        return this;
    }
}

export default MetadataSyncRuleListPageObject;
