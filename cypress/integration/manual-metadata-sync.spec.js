import ManualMetadataSyncPageObject from "../pageobjects/ManualMetadataSyncPageObject";

context("Manual metadata sync", function() {
    const page = new ManualMetadataSyncPageObject(cy);

    const anyDataElement = "ENTO-ADULT- Household Head Name";
    const anyInstance = "Y5QsHDoD4I0";

    beforeEach(() => {
        page.open();
    });

    it("should have the correct title", function() {
        page.title.contains("Metadata Synchronization");
    });

    //TODO: this test is commented because some times on this page the search typing not working
    //      in cypress there are a issue for this bug https://github.com/cypress-io/cypress/issues/5480
    // it("should show correct rows after search", function() {
    //     page.search(anyDataElement).selectRow(anyDataElement);
    // });

    it("should syncs correctly one data element", function() {
        page.selectRow(anyDataElement)
            .openSyncDialog()
            .next()
            .selectReceiverInstance(anyInstance)
            .synchronize()

            .syncResults.contains("Success");

        page.closeSyncResultsDialog();
    });

    it("should show the instance selection step error if user try click on next without selecting an instance", function() {
        page.selectRow(anyDataElement)
            .openSyncDialog()
            .next()
            .next()
            .error.contains("You need to select at least one instance");
    });

    it("should have synchronize button disabled to open sync dialog", function() {
        page.selectRow(anyDataElement)
            .openSyncDialog()
            .syncButton.should("be.disabled");
    });

    it("should have synchronize button disabled if only contains default include exclude", function() {
        page.selectRow(anyDataElement)
            .openSyncDialog()
            .next()
            .syncButton.should("be.disabled");
    });

    it("should have synchronize button enabled if contains org unit, periods, category options and one instance", function() {
        page.selectRow(anyDataElement)
            .openSyncDialog()
            .next()
            .selectReceiverInstance(anyInstance)
            .syncButton.should("not.be.disabled");
    });
});
