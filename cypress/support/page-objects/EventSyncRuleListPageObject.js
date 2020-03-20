import SyncRuleListPageObject from "./common/SyncRuleListPageObject";

class EventSyncRuleListPageObject extends SyncRuleListPageObject {
    open(stubApiResponseName) {
        super.open("/#/sync-rules/events");

        this.cy.wait(`@${stubApiResponseName}`);

        return this;
    }

    synchronize() {
        this.cy
            .route({
                method: "POST",
                url: "/api/events*",
            })
            .as("postEvents");

        this.cy.contains("Execute").click();
        this.cy.wait("@postEvents");
        return this;
    }
}

export default EventSyncRuleListPageObject;
