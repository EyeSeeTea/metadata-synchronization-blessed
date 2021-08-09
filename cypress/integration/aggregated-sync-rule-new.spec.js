import AggregatedSyncRuleDetailPageObject from "../support/page-objects/AggregatedSyncRuleDetailPageObject";

context("Aggregated sync rule new", function () {
    const page = new AggregatedSyncRuleDetailPageObject(cy);

    const inputs = {
        name: "test",
        orgUnit: "Ghana",
        instance: "Y5QsHDoD4I0",
        dataSet: "Malaria annual data",
    };

    beforeEach(() => {
        page.open();
    });

    it("should have the correct title", () => {
        page.assertTitle(title => title.contains("New aggregated synchronization rule"));
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

    it("should show the org unit step error if user try click on next without selecting the org unit", () => {
        page.typeName(inputs.name)
            .next()

            .selectRow(inputs.dataSet)
            .next()

            .next()
            .assertError(error => error.contains("You need to select at least one organisation unit"));
    });

    it("should show the instance selection step error if user try click on next without selecting an instance", () => {
        page.typeName(inputs.name)
            .next()

            .selectRow(inputs.dataSet)
            .next()

            .selectOrgUnit(inputs.orgUnit)
            .next()

            .selectAllPeriods()
            .next()

            .selectAllAttributesCategoryOptions()
            .next()

            // Skip aggregation
            .next()

            .next()
            .assertError(error => error.contains("You need to select at least one instance"));
    });

    it("should create a new Sync Rule", () => {
        page.typeName(inputs.name)
            .next()

            .selectRow(inputs.dataSet)
            .next()

            .selectOrgUnit(inputs.orgUnit)
            .next()

            .selectAllPeriods()
            .next()

            .selectAllAttributesCategoryOptions()
            .next()

            // Skip aggregation
            .next()

            .selectReceiverInstance(inputs.instance)
            .next()

            .next()
            .save()
            .assertSave();
    });
});
