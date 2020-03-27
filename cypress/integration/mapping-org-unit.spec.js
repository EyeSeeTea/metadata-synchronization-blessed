import MappingOrgUnitPageObject from "../support/page-objects/MappingOrgUnitPageObject";

context("OrgUnit mapping", function() {
    const page = new MappingOrgUnitPageObject(cy);

    const inputs = {
        instance: "Y5QsHDoD4I0",
    };

    beforeEach(() => {
        page.open(inputs.instance);
    });

    it("has the correct title", function() {
        page.assertTitle(title =>
            title.contains("Organisation unit mapping - Destination instance this instance (8080)")
        );
    });

    it("has row menu with details action", function() {
        page.openRowActions().assertOption(option => option.contains("Details"));
    });

    it("has row menu with Select with children subtree action", function() {
        page.openRowActions().assertOption(option =>
            option.contains("Select with children subtree")
        );
    });

    it("has row menu with set mapping action", function() {
        page.openRowActions().assertOption(option => option.contains("Set mapping"));
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
});
