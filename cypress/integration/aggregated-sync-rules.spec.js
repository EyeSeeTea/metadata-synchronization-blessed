import AggregatedSyncRuleListPageObject from "../support/page-objects/AggregatedSyncRuleListPageObject";
import { syncRuleFixture } from "../support/utils";

context("Aggregated sync rules", function() {
    const page = new AggregatedSyncRuleListPageObject(cy);

    beforeEach(() => {
        const stubApiResponseName = "getRules";

        syncRuleFixture("aggregated", stubApiResponseName, syncRules => {
            this.syncRules = syncRules;
            page.open(stubApiResponseName);
        });
    });

    it("should have the correct title", () => {
        page.assertTitle(title => title.contains("Aggregated Data Synchronization Rules"));
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
