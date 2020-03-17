import AggregatedSyncRuleDetailPageObject from "../support/page-objects/AggregatedSyncRuleDetailPageObject";

context("Aggregated sync rule edit", function() {
    const page = new AggregatedSyncRuleDetailPageObject(cy);

    beforeEach(() => {
        const stubApiResponseName = "getRules";

        cy.fixture("aggregated-sync-rules.json").then(syncRules => {
            this.syncRule = syncRules[0];
            cy.server();
            cy.route({
                method: "GET",
                url: `api/dataStore/metadata-synchronization/rules`,
                response: syncRules,
            }).as(stubApiResponseName);
            page.open(this.syncRule.id, stubApiResponseName);
        });
    });

    it("should have the correct title", () => {
        page.assertTitle(title => title.contains("Edit aggregated synchronization rule"));
    });

    it("should have the correct general info", () => {
        page.assertName(name => name.should("have.value", this.syncRule.name))
            .assertCode(name => name.should("have.value", this.syncRule.code))
            .assertDescription(name => name.should("have.value", this.syncRule.description));
    });

    it("should have the correct selected data set count", () => {
        page.next()
            .checkOnlySelectedItems()
            .assertSelectedDatasetCountMessage(datasetCountMessage => {
                datasetCountMessage.contains(
                    `There are ${this.syncRule.builder.metadataIds.length} items selected in all pages.`
                );
            });
    });

    it("should have the correct selected org unit", () => {
        page.next()
            .next()
            .assertSelectedOrgUnit(selectedOrgUnit => {
                selectedOrgUnit.contains("Ghana");
            });
    });

    it("should have the correct selected instances", () => {
        page.next()
            .next()
            .next()
            .next()
            .next()
            .assertSelectedInstances(selectedInstances =>
                selectedInstances.select(this.syncRule.builder.targetInstances[0])
            );
    });
});
