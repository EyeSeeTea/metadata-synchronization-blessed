import ManualMetadataSyncPageObject from "../pageobjects/ManualMetadataSyncPageObject";

context("Manual metadata sync", function() {
    const page = new ManualMetadataSyncPageObject(cy);

    const anyDataElement = "ENTO-IR- Mosquito age";
    const anyInstance = "Y5QsHDoD4I0";

    beforeEach(() => {
        page.open();
    });

    it("should have the correct title", function() {
        page.title.contains("Metadata Synchronization");
    });

    it("should syncs correctly one data element", function() {
        page.search(anyDataElement)
            .selectRow(anyDataElement)
            .openSyncDialog()
            .next()
            .selectReceiverInstance(anyInstance)
            .synchronize()

            .syncResults.contains("Success");

        page.closeSyncResultsDialog();
    });

    it("should show the instance selection step error if user try click on next without selecting an instance", function() {
        page.search(anyDataElement)
            .selectRow(anyDataElement)
            .openSyncDialog()
            .next()
            .next()
            .error.contains("You need to select at least one instance");
    });

    it("should have synchronize button disabled to open sync dialog", function() {
        page.search(anyDataElement)
            .selectRow(anyDataElement)
            .openSyncDialog()
            .syncButton.should("be.disabled");
    });

    it("should have synchronize button disabled if only contains default include exclude", function() {
        page.search(anyDataElement)
            .selectRow(anyDataElement)
            .openSyncDialog()
            .next()
            .syncButton.should("be.disabled");
    });

    it("should have synchronize button enabled if contains org unit, periods, category options and one instance", function() {
        page.search(anyDataElement)
            .selectRow(anyDataElement)
            .openSyncDialog()
            .next()
            .selectReceiverInstance(anyInstance)
            .syncButton.should("not.be.disabled");
    });
});
