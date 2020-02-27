import ManualEventSyncPageObject from "../support/page-objects/ManualEventSyncPageObject";
/**
 * Database: d2-docker-eyeseetea-2-30-datasync-sender
 */
context("Manual event sync", function() {
    const page = new ManualEventSyncPageObject(cy);

    const inputs = {
        orgUnit: "Ahafo",
        orgUnitLevel: "Level 5",
        instance: "pxPV4coHU56",
        program: "ENTO- ",
    };

    beforeEach(() => {
        page.open();
    });

    it("should show the event step error if user try click on next without event", function() {
        page.search(inputs.program)
            .selectRow(inputs.program)
            .openSyncDialog()

            .selectOrgUnit(inputs.orgUnit)
            .selectOrgUnitLevel(inputs.orgUnitLevel)
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
});
