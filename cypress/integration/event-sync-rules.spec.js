import EventSyncRuleListPageObject from "../support/page-objects/EventSyncRuleListPageObject";

context("Event sync rules", function() {
    const page = new EventSyncRuleListPageObject(cy);

    beforeEach(() => {
        const stubApiResponseName = "getRules";

        cy.fixture("event-sync-rules.json").then(syncRules => {
            cy.fixture("event-sync-rule.json").then(syncRuleBuilder => {
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
