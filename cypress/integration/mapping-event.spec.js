import MappingEventPageObject from "../support/page-objects/MappingEventPageObject";

context("Event mapping", function() {
    const page = new MappingEventPageObject(cy);

    const inputs = {
        instance: "Y5QsHDoD4I0",
    };

    beforeEach(() => {
        page.open(inputs.instance);
    });

    it("has the correct title", function() {
        page.assertTitle(title =>
            title.contains("Program (events) mapping - Destination instance this instance (8080)")
        );
    });

    it("has row menu with details action", function() {
        page.openRowActions().assertOption(option => option.contains("Details"));
    });

    it("has row menu with set mapping action", function() {
        page.openRowActions().assertOption(option => option.contains("Set mapping"));
    });

    it("has row menu with select children action", function() {
        page.openRowActions().assertOption(option => option.contains("Select children"));
    });

    it("has row menu with auto-map element action", function() {
        page.openRowActions().assertOption(option => option.contains("Auto-map element"));
    });

    it("has row menu with exclude mapping action", function() {
        page.openRowActions().assertOption(option => option.contains("Exclude mapping"));
    });

    it("has row menu with Reset mapping to default values action", function() {
        page.openRowActions().assertOption(option =>
            option.contains("Reset mapping to default values")
        );
    });

    it("has general menu with Column settings action", function() {
        page.openBulkActions().assertOption(option => option.contains("Column settings"));
    });

    it("has general menu with validate mapping action", function() {
        page.openBulkActions().assertOption(option => option.contains("Validate mapping"));
    });

    it("has general menu with reset mapping action", function() {
        page.openBulkActions().assertOption(option => option.contains("Reset mapping"));
    });

    it("has general menu with exclude mapping action", function() {
        page.openBulkActions().assertOption(option => option.contains("Exclude mapping"));
    });
});
