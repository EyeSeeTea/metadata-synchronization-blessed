import MappingAggregatedPageObject from "../support/page-objects/MappingAggregatedPageObject";

context("Aggregated mapping", function() {
    const page = new MappingAggregatedPageObject(cy);

    const inputs = {
        instance: "Y5QsHDoD4I0",
    };

    beforeEach(() => {
        page.open(inputs.instance);
    });

    it("has the correct title", function() {
        page.assertTitle(title =>
            title.contains("Aggregated mapping - Destination instance this instance (8080)")
        );
    });

    it("row menu has the details action", function() {
        page.openRowActions().assertOption(option => option.contains("Details"));
    });

    it("row menu has the set mapping action", function() {
        page.openRowActions().assertOption(option => option.contains("Set mapping"));
    });

    it("row menu has the auto-map element action", function() {
        page.openRowActions().assertOption(option => option.contains("Auto-map element"));
    });

    it("row menu has the exclude mapping action", function() {
        page.openRowActions().assertOption(option => option.contains("Exclude mapping"));
    });

    it("row menu has the Reset mapping to default values action", function() {
        page.openRowActions().assertOption(option =>
            option.contains("Reset mapping to default values")
        );
    });
});
