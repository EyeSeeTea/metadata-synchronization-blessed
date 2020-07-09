import MetadataSyncRuleListPageObject from "../support/page-objects/MetadataSyncRuleListPageObject";
import { syncRuleFixture } from "../support/utils";

context("Metadata sync rules ", function() {
    const page = new MetadataSyncRuleListPageObject(cy);

    beforeEach(() => {
        const stubApiResponseName = "getRules";

        syncRuleFixture("metadata", stubApiResponseName, syncRules => {
            this.syncRules = syncRules;
            page.open(stubApiResponseName);
        });
    });

    it("should have the correct title", () => {
        page.assertTitle(title => title.contains("Metadata Synchronization Rules"));
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
