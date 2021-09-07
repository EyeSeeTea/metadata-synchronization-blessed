import EventSyncRuleDetailPageObject from "../support/page-objects/EventSyncRuleDetailPageObject";

context("Event sync rule new", function () {
    const page = new EventSyncRuleDetailPageObject(cy);

    const inputs = {
        name: "test",
        instance: "Y5QsHDoD4I0",
        orgUnit: "Akrodie Health Centre",
        orgUnitLevel0: "Ghana",
        orgUnitLevel1: "Ahafo",
        orgUnitLevel2: "Asunafo North",
        orgUnitLevel3: "Akrodie",
        event: "PoKTdJQa8pV",
        program: "ENTO- Discriminating concentration bioassay",
    };

    beforeEach(() => {
        page.open();
    });

    it("should have the correct title", () => {
        page.assertTitle(title => title.contains("New events synchronization rule"));
    });

    it("should show name step error if user try click on next without type a name", () => {
        page.next().assertError(error => error.contains("Field name cannot be blank"));
    });

    it("should show metadata step error if user try click on next without selecting an metadata item", () => {
        page.typeName(inputs.name)
            .next()

            .expandOrgUnit(inputs.orgUnitLevel0)
            .expandOrgUnit(inputs.orgUnitLevel1)
            .expandOrgUnit(inputs.orgUnitLevel2)
            .expandOrgUnit(inputs.orgUnitLevel3)
            .selectOrgUnit(inputs.orgUnit)
            .next()

            .next()
            .assertError(error => error.contains("You need to select at least one metadata element"));
    });

    it("should show the org unit step error if user try click on next without selecting the org unit", () => {
        page.typeName(inputs.name)
            .next()
            .next()
            .assertError(error => error.contains("You need to select at least one organisation unit"));
    });

    it("should show the instance selection step error if user try click on next without selecting an instance", () => {
        page.typeName(inputs.name)
            .next()

            .expandOrgUnit(inputs.orgUnitLevel0)
            .expandOrgUnit(inputs.orgUnitLevel1)
            .expandOrgUnit(inputs.orgUnitLevel2)
            .expandOrgUnit(inputs.orgUnitLevel3)
            .selectOrgUnit(inputs.orgUnit)
            .next()

            .selectRow(inputs.program)
            .next()

            .selectAllPeriods()
            .next()

            .toggleAllEvents(false)
            .selectEvent(inputs.event)
            .next()
            .next()

            .next()
            .assertError(error => error.contains("You need to select at least one instance"));
    });

    it("should create a new Sync Rule", () => {
        page.typeName(inputs.name)
            .next()

            .expandOrgUnit(inputs.orgUnitLevel0)
            .expandOrgUnit(inputs.orgUnitLevel1)
            .expandOrgUnit(inputs.orgUnitLevel2)
            .expandOrgUnit(inputs.orgUnitLevel3)
            .selectOrgUnit(inputs.orgUnit)
            .next()

            .selectRow(inputs.program)
            .next()

            .selectAllPeriods()
            .next()

            .toggleAllEvents(false)
            .selectEvent(inputs.event)
            .next()
            .next()

            .selectReceiverInstance(inputs.instance)
            .next()

            .next()
            .save()
            .assertSave();
    });
});
