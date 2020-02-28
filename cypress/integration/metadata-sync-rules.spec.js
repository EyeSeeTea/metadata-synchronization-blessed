import MetadataSyncRuleListPageObject from "../support/page-objects/MetadataSyncRuleListPageObject";

context("Metadata sync rule new", function() {
    const page = new MetadataSyncRuleListPageObject(cy);

    beforeEach(() => {
        cy.fixture("metadata-sync-rules.json").then(syncRules => {
            this.syncRules = syncRules;
            cy.server();
            cy.route({
                method: "GET",
                url: `api/dataStore/metadata-synchronization/rules`,
                response: syncRules,
            }).as("getRules");
            page.open();
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
