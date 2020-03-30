import MetadataSyncRuleDetailPageObject from "../support/page-objects/MetadataSyncRuleDetailPageObject";
import { syncRuleFixture } from "../support/utils";

context("Metadata sync rule edit", function() {
    const page = new MetadataSyncRuleDetailPageObject(cy);

    beforeEach(() => {
        syncRuleFixture("metadata", "getRules", syncRules => {
            this.syncRule = syncRules[0];
            page.open(this.syncRule.id);
        });
    });

    it("should have the correct title", () => {
        page.assertTitle(title => title.contains("Edit metadata synchronization rule"));
    });

    it("should have the correct general info", () => {
        page.assertName(name => name.should("have.value", this.syncRule.name))
            .assertCode(name => name.should("have.value", this.syncRule.code))
            .assertDescription(name => name.should("have.value", this.syncRule.description));
    });

    it("should have the correct selected metadata", () => {
        page.next()
            .selectFilterInTable("Metadata type", "Data Element")
            .checkOnlySelectedItems()
            .assertSelectedMetadata(selectedMetadata => {
                selectedMetadata.contains(
                    `There are ${this.syncRule.builder.metadataIds.length} items selected in all pages.`
                );
            });
    });

    it("should have the correct selected instances", () => {
        page.next()
            .next()
            .next()
            .assertSelectedInstances(selectedInstances =>
                selectedInstances.select(this.syncRule.builder.targetInstances[0])
            );
    });
});
