import SyncRuleListPageObject from "./common/SyncRuleListPageObject";

class AggregatedSyncRuleListPageObject extends SyncRuleListPageObject {
    open(stubApiResponseName) {
        super.open("/#/sync-rules/aggregated");

        this.cy.wait(`@${stubApiResponseName}`);

        return this;
    }

    synchronize() {
        this.cy
            .route({
                method: "POST",
                url: "/api/dataValueSets*",
            })
            .as("postDataValueSets");

        this.cy.contains("Execute").click();
        this.cy.wait("@postDataValueSets");
        return this;
    }
}

export default AggregatedSyncRuleListPageObject;
