import EventSyncRuleDetailPageObject from "../support/page-objects/EventSyncRuleDetailPageObject";
import { syncRuleFixture } from "../support/utils";

context("Event sync rule edit", function () {
    const page = new EventSyncRuleDetailPageObject(cy);

    beforeEach(() => {
        const stubApiResponseName = "getRules";

        syncRuleFixture("events", stubApiResponseName, syncRules => {
            this.syncRule = syncRules[0];
            page.open(this.syncRule.id, stubApiResponseName);
        });
    });

    it("should have the correct title", () => {
        page.assertTitle(title => title.contains("Edit events synchronization rule"));
    });

    it("should have the correct general info", () => {
        page.assertName(name => name.should("have.value", this.syncRule.name))
            .assertCode(name => name.should("have.value", this.syncRule.code))
            .assertDescription(name => name.should("have.value", this.syncRule.description));
    });

    it("should have the correct selected program count", () => {
        page.next()
            .next()
            .checkOnlySelectedItems()
            .assertSelectedProgramsCountMessage(programCountMessage => {
                programCountMessage.contains(
                    `There are ${this.syncRule.builder.metadataIds.length} items selected in all pages.`
                );
            });
    });

    it("should have the correct selected event", () => {
        page.next().next().next().next().assertSelectedEvent(`${this.syncRule.builder.dataParams.events[0]}`);
    });

    it("should have the correct selected org unit", () => {
        page.next().assertSelectedOrgUnit(selectedOrgUnit => {
            selectedOrgUnit.contains("Akrodie Health Centre");
        });
    });

    it("should have the correct selected instances", () => {
        page.next()
            .next()
            .next()
            .next()
            .next()
            .next()
            .assertSelectedInstances(selectedInstances =>
                selectedInstances.select(this.syncRule.builder.targetInstances[0])
            );
    });
});
