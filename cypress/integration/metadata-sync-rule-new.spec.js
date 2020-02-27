import MetadataSyncRuleDetailPageObject from "../support/page-objects/MetadataSyncRuleDetailPageObject";

context("Metadata sync rule new", function() {
    const page = new MetadataSyncRuleDetailPageObject(cy);

    beforeEach(() => {
        page.open();
    });

    it("should have the correct title", () => {
        page.assertTitle(title => title.contains("New metadata synchronization rule"));
    });
});
