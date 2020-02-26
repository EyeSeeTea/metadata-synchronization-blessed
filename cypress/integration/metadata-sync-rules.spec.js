import MetadataSyncRulesPageObject from "../support/page-objects/MetadataSyncRulesPageObject";

context("Manual metadata sync", function() {
    const page = new MetadataSyncRulesPageObject(cy);

    beforeEach(() => {
        page.open();
    });

    it("should have the correct title", () => {
        page.assertTitle(title => title.contains("Metadata Synchronization Rules"));
    });
});
