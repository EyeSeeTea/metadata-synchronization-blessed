import MappingAggregatedPageObject from "../support/page-objects/MappingAggregatedPageObject";

context("Aggregated mapping", function () {
    const page = new MappingAggregatedPageObject(cy);

    const inputs = {
        instance: "Y5QsHDoD4I0",
        dataelement: "External funding",
        alternativeDataelement: "Funding need (USD)",
    };

    beforeEach(() => {
        page.open(inputs.instance);
    });

    it("should set mapping element", function () {
        page.checkCheckboxByText(inputs.alternativeDataelement);

        page.openSelectedRowMenu().clickOption("Set mapping");
        page.assertMappedObjectTitle(dialog =>
            dialog.contains(
                "Edit mapping for Funding need (USD) (FRbgzTZ74Hh) - Data Element - Destination instance this instance (8080)"
            )
        );

        page.selectMappingObject(inputs.alternativeDataelement);

        page.closeDialog();
        page.assertRowStatus(row => row.contains("Mapped"), inputs.alternativeDataelement);
    });

    it("should show related metadata mapping option on mapped object", function () {
        page.checkCheckboxByText(inputs.dataelement);

        page.openRowMenu().clickOption("Auto-map element");

        page.closeDialog();
        page.assertRowStatus(row => row.contains("Mapped"), inputs.alternativeDataelement);

        page.checkCheckboxByText(inputs.dataelement);

        page.openSelectedRowMenu().assertOption(option => option.contains("Related metadata mapping"));
    });

    it("should auto-map element", function () {
        page.checkCheckboxByText(inputs.dataelement);

        page.openRowMenu().clickOption("Auto-map element");
        page.assertDialog(dialog => dialog.contains("There are 1 items selected in all pages."));
        page.assertMappedObjectTitle(dialog =>
            dialog.contains(
                "Edit mapping for External funding (tpz77FcntKx) - Data Element - Destination instance this instance (8080)"
            )
        );

        page.closeDialog();
        page.assertRowStatus(row => row.contains("Mapped"), inputs.dataelement);
    });

    it("should exclude element", function () {
        page.checkCheckboxByText(inputs.dataelement);
        page.openRowMenu().clickOption("Exclude mapping");
        page.assertDialog(dialog => dialog.contains("Are you sure you want to exclude mapping for 1 elements?"));

        page.clickOkOnDialog();
        page.assertRowStatus(row => row.contains("Excluded"), inputs.dataelement);
    });

    it("should validate mapping", function () {
        page.checkCheckboxByText(inputs.dataelement);
        page.openRowMenu().clickOption("Auto-map element");
        page.closeDialog();

        page.openRowMenu().clickOption("Validate mapping");
        page.assertDialog(dialog => dialog.contains("Are you sure you want to validate mapping for 1 elements?"));

        page.clickOkOnDialog();
        page.assertRowStatus(row => row.contains("Mapped"), inputs.dataelement);
    });

    it("should have the correct title", function () {
        page.assertTitle(title => title.contains("Aggregated mapping - Destination instance this instance (8080)"));
    });

    it("should have row menu with details action", function () {
        page.openRowMenu().assertOption(option => option.contains("Details"));
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

    it("should have general menu with validate mapping action", function () {
        page.openGeneralMenu().assertOption(option => option.contains("Validate mapping"));
    });

    it("should have general menu with reset mapping action", function () {
        page.openGeneralMenu().assertOption(option => option.contains("Reset mapping"));
    });

    it("should have general menu with exclude mapping action", function () {
        page.openGeneralMenu().assertOption(option => option.contains("Exclude mapping"));
    });
});
