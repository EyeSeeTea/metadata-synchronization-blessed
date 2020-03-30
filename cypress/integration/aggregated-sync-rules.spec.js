import AggregatedSyncRuleListPageObject from "../support/page-objects/AggregatedSyncRuleListPageObject";

context("Aggregated sync rules", function() {
    const page = new AggregatedSyncRuleListPageObject(cy);

    beforeEach(() => {
        const stubApiResponseName = "getRules";

        cy.fixture("aggregated-sync-rules.json").then(syncRules => {
            cy.fixture("aggregated-sync-rule.json").then(syncRuleBuilder => {
                this.syncRules = syncRules;
                cy.server();
                cy.route({
                    method: "GET",
                    url: `api/dataStore/metadata-synchronization/rules`,
                    response: syncRules,
                }).as(stubApiResponseName);
                for (const { id } of syncRules) {
                    cy.route({
                        method: "GET",
                        url: `api/dataStore/metadata-synchronization/rules-${id}`,
                        response: syncRuleBuilder,
                    });
                }
                page.open(stubApiResponseName);
            });
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
