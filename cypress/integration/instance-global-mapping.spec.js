import MappingGlobalPageObject from "../support/page-objects/MappingGlobalPageObject";

context("Global mapping", function () {
    const page = new MappingGlobalPageObject(cy);

    const inputs = {
        instance: "Y5QsHDoD4I0",
        objectName: "0-4 years",
        alternativeObjectName: "15+ years",
        aexcludedObjectName: "5-14 years",
    };

    beforeEach(() => {
        page.open(inputs.instance);
    });

    it("should have the correct title", function () {
        page.assertTitle(title => title.contains("Global mapping - Destination instance this instance (8080)"));
    });

    it("should set mapping element", function () {
        page.checkCheckboxByText(inputs.alternativeObjectName);

        page.openSelectedRowMenu().clickOption("Set mapping");
        page.assertMappedObjectTitle(dialog =>
            dialog.contains(
                "Edit mapping for 15+ years (wTpH7wugXzZ) - Category Option - Destination instance this instance (8080)"
            )
        );

        page.selectMappingObject(inputs.alternativeObjectName);

        page.closeDialog();
        page.assertRowStatus(row => row.contains("Mapped"), inputs.alternativeObjectName);
    });

    it("should auto-map element", function () {
        page.checkCheckboxByText(inputs.objectName);

        page.openRowMenu().clickOption("Auto-map element");
        page.assertDialog(dialog => dialog.contains("There are 1 items selected in all pages."));
        page.assertMappedObjectTitle(dialog =>
            dialog.contains(
                "Edit mapping for 0-4 years (UPvKbcqTEY3) - Category Option - Destination instance this instance (8080)"
            )
        );

        page.closeDialog();
        page.assertRowStatus(row => row.contains("Mapped"), inputs.objectName);
    });

    it("should exclude element", function () {
        page.checkCheckboxByText(inputs.aexcludedObjectName);
        page.openSelectedRowMenu().clickOption("Exclude mapping");
        page.assertDialog(dialog => dialog.contains("Are you sure you want to exclude mapping for 1 elements?"));

        page.clickOkOnDialog();
        page.assertRowStatus(row => row.contains("Excluded"), inputs.aexcludedObjectName);
    });

    it("should validate mapping", function () {
        page.checkCheckboxByText(inputs.alternativeObjectName);
        page.openSelectedRowMenu().clickOption("Auto-map element");
        page.closeDialog();

        page.checkCheckboxByText(inputs.alternativeObjectName);
        page.openSelectedRowMenu().clickOption("Validate mapping");
        page.assertDialog(dialog => dialog.contains("Are you sure you want to validate mapping for 1 elements?"));

        page.clickOkOnDialog();
        page.assertRowStatus(row => row.contains("Mapped"), inputs.alternativeObjectName);
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

    it("should have row menu with Reset mapping to default values action", function () {
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
