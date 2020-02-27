import ManualEventSyncPageObject from "../support/page-objects/ManualEventSyncPageObject";
/**
 * Database: d2-docker-eyeseetea-2-30-datasync-sender
 */
context("Manual event sync", function() {
    const page = new ManualEventSyncPageObject(cy);

    const inputs = {
        orgUnit: "Akrodie Health Centre",
        orgUnitLevel1: "Ahafo",
        orgUnitLevel2: "Asunafo North",
        orgUnitLevel3: "Akrodie",
        event: "PoKTdJQa8pV",
        instance: "Y5QsHDoD4I0",
        program: "ENTO- ",
    };

    beforeEach(() => {
        page.open();
    });

    it("should sync correctly event", () => {
        page.search(inputs.program)
            .selectRow(inputs.program)
            .openSyncDialog()

            .displayOrgUnitChildren(inputs.orgUnitLevel1)
            .displayOrgUnitChildren(inputs.orgUnitLevel2)
            .displayOrgUnitChildren(inputs.orgUnitLevel3)
            .selectOrgUnit(inputs.orgUnit)
            .next()

            .selectAllPeriods()
            .next()

            .selectEvent(inputs.event)
            .next()
            .next()

            .selectReceiverInstance(inputs.instance)
            .synchronize()

            .assertSyncResultsStatus(status => status.contains("Success"))
            .closeSyncResultsDialog();
    });

    it("should show the instance selection step error if user try click on next without selecting an instance", () => {
        page.search(inputs.program)
            .selectRow(inputs.program)
            .openSyncDialog()

            .displayOrgUnitChildren(inputs.orgUnitLevel1)
            .displayOrgUnitChildren(inputs.orgUnitLevel2)
            .displayOrgUnitChildren(inputs.orgUnitLevel3)
            .selectOrgUnit(inputs.orgUnit)
            .next()

            .selectAllPeriods()
            .next()

            .selectEvent(inputs.event)
            .next()
            .next()

            .assertError(error => error.contains("You need to select at least one instance"));
    });

    it("should show the event step error if user try click on next without event", function() {
        page.search(inputs.program)
            .selectRow(inputs.program)
            .openSyncDialog()

            .displayOrgUnitChildren(inputs.orgUnitLevel1)
            .displayOrgUnitChildren(inputs.orgUnitLevel2)
            .displayOrgUnitChildren(inputs.orgUnitLevel3)
            .selectOrgUnit(inputs.orgUnit)
            .next()

            .selectAllPeriods()
            .next()

            .next()
            .assertError(error => error.contains("You need to select at least one event"));
    });

    it("should have the correct title", function() {
        page.assertTitle(title => title.contains("Events Synchronization"));
    });

    it("should show the org unit step error if user try click on next without selecting the org unit", function() {
        page.search(inputs.program)
            .selectRow(inputs.program)
            .openSyncDialog()
            .next()
            .assertError(error =>
                error.contains("You need to select at least one organisation unit")
            );
    });

    it("should have synchronize button disabled to open sync dialog", () => {
        page.search(inputs.program)
            .selectRow(inputs.program)
            .openSyncDialog()
            .assertSyncButton(syncButton => syncButton.should("be.disabled"));
    });

    it("should have synchronize button disabled if only contains org unit", () => {
        page.search(inputs.program)
            .selectRow(inputs.program)
            .openSyncDialog()

            .displayOrgUnitChildren(inputs.orgUnitLevel1)
            .displayOrgUnitChildren(inputs.orgUnitLevel2)
            .displayOrgUnitChildren(inputs.orgUnitLevel3)
            .selectOrgUnit(inputs.orgUnit)
            .next()

            .assertSyncButton(syncButton => syncButton.should("be.disabled"));
    });

    it("should have synchronize button disabled if only contains org unit and periods", () => {
        page.search(inputs.program)

            .selectRow(inputs.program)
            .openSyncDialog()

            .displayOrgUnitChildren(inputs.orgUnitLevel1)
            .displayOrgUnitChildren(inputs.orgUnitLevel2)
            .displayOrgUnitChildren(inputs.orgUnitLevel3)
            .selectOrgUnit(inputs.orgUnit)
            .next()

            .selectAllPeriods()
            .next()

            .assertSyncButton(syncButton => syncButton.should("be.disabled"));
    });

    it("should have synchronize button disabled if only contains org unit, periods and event", () => {
        page.search(inputs.program)
            .selectRow(inputs.program)
            .openSyncDialog()

            .displayOrgUnitChildren(inputs.orgUnitLevel1)
            .displayOrgUnitChildren(inputs.orgUnitLevel2)
            .displayOrgUnitChildren(inputs.orgUnitLevel3)
            .selectOrgUnit(inputs.orgUnit)
            .next()

            .selectAllPeriods()
            .next()

            .selectEvent(inputs.event)
            .next()

            .assertSyncButton(syncButton => syncButton.should("be.disabled"));
    });
});
