import ManualEventSyncPageObject from "../pageobjects/ManualEventSyncPageObject";

/**
 * Database: d2-docker-eyeseetea-2-30-datasync-sender
 */
context("Manual event sync", function() {
    const page = new ManualEventSyncPageObject(cy);

    const anyOrgUnit = "Ahafo";
    const anyInstance = "pxPV4coHU56";
    const anyProgram = "ENTO- ";

    beforeEach(() => {
        page.open();
    });

    it("should have the correct title", function() {
        page.title.contains("Events Synchronization");
    });

    it("should show the org unit step error if user try click on next without selecting the org unit", function() {
        page.search(anyProgram)
            .selectRow(anyProgram)
            .openSyncDialog()
            .next()

            .error.contains("You need to select at least one organisation unit");
    });
});
