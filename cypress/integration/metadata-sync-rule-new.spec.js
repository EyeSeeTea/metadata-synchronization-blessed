import MetadataSyncRuleDetailPageObject from "../support/page-objects/MetadataSyncRuleDetailPageObject";

context("Metadata sync rule new", function () {
    const page = new MetadataSyncRuleDetailPageObject(cy);

    const inputs = {
        name: "test",
        filterLabel: "Metadata type",
        filterValue: "Data Element",
        dataElement: "ENTO-ADULT- Household Head Name",
        instance: "Y5QsHDoD4I0",
    };

    beforeEach(() => {
        page.open();
    });

    it("should have the correct title", () => {
        page.assertTitle(title => title.contains("New metadata synchronization rule"));
    });

    it("should show name step error if user try click on next without type a name", () => {
        page.next().assertError(error => error.contains("Field name cannot be blank"));
    });

    it("should show metadata step error if user try click on next without selecting an metadata item", () => {
        page.typeName(inputs.name)
            .next()
            .next()
            .assertError(error => error.contains("You need to select at least one metadata element"));
    });

    it("should show the instance selection step error if user try click on next without selecting an instance", () => {
        page.typeName(inputs.name)
            .next()
            .selectFilterInTable(inputs.filterLabel, inputs.filterValue)
            .selectRow(inputs.dataElement)
            .next()
            .next()
            .next()
            .assertError(error => error.contains("You need to select at least one instance"));
    });

    it("should create a new Sync Rule", () => {
        page.typeName(inputs.name)
            .next()
            .selectFilterInTable(inputs.filterLabel, inputs.filterValue)
            .selectRow(inputs.dataElement)
            .next()
            .changeUseDefaultConfiguration()
            .selectMetadataType("Data Element")
            .excludeRule("Attributes")
            .next()
            .selectReceiverInstance(inputs.instance)
            .next()
            .next()
            .save()
            .assertSave();
    });
});
