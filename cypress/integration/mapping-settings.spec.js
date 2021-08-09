import InstanceMappingPageObject from "../support/page-objects/InstanceMappingPageObject";

context("Instance mapping Settings", function () {
    const page = new InstanceMappingPageObject(cy);

    beforeEach(() => {
        page.open("this instance (8080)");
    });

    it("has the correct title", function () {
        page.assertMappingTitle(title =>
            title.contains("Instance mapping - Destination instance this instance (8080)")
        );
    });

    it("should have aggregated section", function () {
        page.assertOption(title => title.contains("Aggregated"));
    });

    it("should open aggregated section", function () {
        page.openSection("aggregated");
        page.assertTitle(title => title.contains("Aggregated mapping - Destination instance this instance (8080)"));
    });

    it("should have programs section", function () {
        page.assertOption(title => title.contains("Programs (events)"));
    });

    it("should open program (events) section", function () {
        page.openSection("programs-events");
        page.assertTitle(title =>
            title.contains("Program (events) mapping - Destination instance this instance (8080)")
        );
    });

    it("should have Organisation units section", function () {
        page.assertOption(title => title.contains("Organisation units"));
    });

    it("should open organisation units section", function () {
        page.openSection("organisation-units");
        page.assertTitle(title =>
            title.contains("Organisation unit mapping - Destination instance this instance (8080)")
        );
    });

    it("should have global section", function () {
        page.assertOption(title => title.contains("Global"));
    });

    it("should open global section", function () {
        page.openSection("global");
        page.assertTitle(title => title.contains("Global mapping - Destination instance this instance (8080)"));
    });
});
