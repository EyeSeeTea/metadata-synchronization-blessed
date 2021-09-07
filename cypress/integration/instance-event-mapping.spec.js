import MappingEventPageObject from "../support/page-objects/MappingEventPageObject";

context("Event mapping", function () {
    const page = new MappingEventPageObject(cy);

    const inputs = {
        instance: "Y5QsHDoD4I0",
        program: "ENTO- Discriminating concentration bioassay",
        alternativeProgram: "ENTO- Adult Surveillance",
        excludedProgram: "ENTO- Inmature stages surveillance",
    };

    beforeEach(() => {
        page.open(inputs.instance);
    });

    it("should have the correct title", function () {
        page.assertTitle(title =>
            title.contains("Program (events) mapping - Destination instance this instance (8080)")
        );
    });

    it("should set mapping element", function () {
        page.checkCheckboxByText(inputs.alternativeProgram);

        page.openSelectedRowMenu().clickOption("Set mapping");
        page.assertMappedObjectTitle(dialog =>
            dialog.contains(
                "Edit mapping for ENTO- Adult Surveillance (RwKq3U8uLjU) - Program - Destination instance this instance (8080)"
            )
        );

        page.selectMappingObject(inputs.alternativeProgram);

        page.closeDialog();
        page.assertRowStatus(row => row.contains("Mapped"), inputs.alternativeProgram);
    });

    it("should show related metadata mapping option on mapped object", function () {
        page.checkCheckboxByText(inputs.program);

        page.openRowMenu().clickOption("Auto-map element");

        page.closeDialog();
        page.assertRowStatus(row => row.contains("Mapped"), inputs.alternativeProgram);

        page.checkCheckboxByText(inputs.program);

        page.openSelectedRowMenu().assertOption(option => option.contains("Related metadata mapping"));
    });

    it("should auto-map element", function () {
        page.checkCheckboxByText(inputs.program);

        page.openRowMenu().clickOption("Auto-map element");
        page.assertDialog(dialog => dialog.contains("There are 1 items selected in all pages."));
        page.assertMappedObjectTitle(dialog =>
            dialog.contains(
                "Edit mapping for ENTO- Discriminating concentration bioassay (G9hvxFI8AYC) - Program - Destination instance this instance (8080)"
            )
        );

        page.closeDialog();
        page.assertRowStatus(row => row.contains("Mapped"), inputs.program);
    });

    it("should exclude element", function () {
        page.checkCheckboxByText(inputs.excludedProgram);
        page.openSelectedRowMenu().clickOption("Exclude mapping");
        page.assertDialog(dialog => dialog.contains("Are you sure you want to exclude mapping for 1 elements?"));

        page.clickOkOnDialog();
        page.assertRowStatus(row => row.contains("Excluded"), inputs.excludedProgram);
    });

    it("should validate mapping", function () {
        page.checkCheckboxByText(inputs.alternativeProgram);
        page.openSelectedRowMenu().clickOption("Auto-map element");
        page.closeDialog();

        page.checkCheckboxByText(inputs.alternativeProgram);
        page.openSelectedRowMenu().clickOption("Validate mapping");
        page.assertDialog(dialog => dialog.contains("Are you sure you want to validate mapping for 1 elements?"));

        page.clickOkOnDialog();
        page.assertRowStatus(row => row.contains("Mapped"), inputs.alternativeProgram);
    });

    it("should have row menu with details action", function () {
        page.openRowMenu().assertOption(option => option.contains("Details"));
    });

    it("should have row menu with set mapping action", function () {
        page.openRowMenu().assertOption(option => option.contains("Set mapping"));
    });

    it("should have row menu with select children action", function () {
        page.openRowMenu().assertOption(option => option.contains("Select children"));
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
