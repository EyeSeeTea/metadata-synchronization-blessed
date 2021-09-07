import MappingOrgUnitPageObject from "../support/page-objects/MappingOrgUnitPageObject";

context("OrgUnit mapping", function () {
    const page = new MappingOrgUnitPageObject(cy);

    const inputs = {
        instance: "Y5QsHDoD4I0",
    };

    beforeEach(() => {
        page.open(inputs.instance);
    });

    it("should have he correct title", function () {
        page.assertTitle(title =>
            title.contains("Organisation unit mapping - Destination instance this instance (8080)")
        );
    });

    it("should have row menu with details action", function () {
        page.openRowMenu().assertOption(option => option.contains("Details"));
    });

    it("should have row menu with Select with children subtree action", function () {
        page.openRowMenu().assertOption(option => option.contains("Select with children subtree"));
    });

    it("should have row menu with set mapping action", function () {
        page.openRowMenu().assertOption(option => option.contains("Set mapping"));
    });

    it("should have row menu with auto-map element action", function () {
        page.openRowMenu().assertOption(option => option.contains("Auto-map element"));
    });

    it("should have row menu with exclude mapping action", function () {
        page.openRowMenu().assertOption(option => option.contains("Exclude mapping"));
    });

    it("should have ow menu with Reset mapping to default values action", function () {
        page.openRowMenu().assertOption(option => option.contains("Reset mapping to default values"));
    });

    it("should have general menu with Column settings action", function () {
        page.openGeneralMenu().assertOption(option => option.contains("Column settings"));
    });
});
