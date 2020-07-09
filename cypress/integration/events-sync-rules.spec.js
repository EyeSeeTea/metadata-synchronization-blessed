import EventSyncRuleListPageObject from "../support/page-objects/EventSyncRuleListPageObject";
import { syncRuleFixture } from "../support/utils";
context("Event sync rules", function() {
    const page = new EventSyncRuleListPageObject(cy);

    beforeEach(() => {
        const stubApiResponseName = "getRules";

        syncRuleFixture("events", stubApiResponseName, syncRules => {
            this.syncRules = syncRules;
            page.open(stubApiResponseName);
        });
    });

    it("should have the correct title", () => {
        page.assertTitle(title => title.contains("Events Synchronization Rules"));
    });

    it("should contains expected rows count", () => {
        page.assertRowsCount(this.syncRules.length);
    });

    it("should sync correctly a sync rule", () => {
        page.openActionsMenu(0)
            .synchronize()
            .assertSyncResultsStatus(status => status.contains("Success"));
    });
});
