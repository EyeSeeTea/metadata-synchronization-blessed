import ManualAggregateSyncPageObject from "../pageobjects/ManualAggregateSyncPageObject";

/**
 * Database: d2-docker-eyeseetea-2-30-datasync-sender
 */
context("Manual aggregated sync", function() {
    const page = new ManualAggregateSyncPageObject(cy);

    const anyOrgUnit = "Ghana";
    const anyInstance = "Y5QsHDoD4I0";
    const anyDataset = "Malaria annual data";

    beforeEach(() => {
        page.open();
    });

    it("should have the correct title", function() {
        page.title.contains("Aggregated Data Synchronization");
    });

    it("should syncs correctly malaria annual data", function() {
        page.search(anyDataset)
            .selectRow(anyDataset)
            .openSyncDialog()

            .selectOrgUnit(anyOrgUnit)
            .next()

            .selectAllPeriods()
            .next()

            .selectAllAttributesCategoryOptions()
            .next()

            .selectReceiverInstance(anyInstance)
            .synchronize()

            .syncResults.contains("Success");

        page.closeSyncResultsDialog();
    });

    it("should show the org unit step error if user try click on next without selecting the org unit", function() {
        page.search(anyDataset)
            .selectRow(anyDataset)
            .openSyncDialog()
            .next()

            .error.contains("You need to select at least one organisation unit");
    });

    it("should show the instance selection step error if user try click on next without selecting an instance", function() {
        page.search(anyDataset)
            .selectRow(anyDataset)
            .openSyncDialog()

            .selectOrgUnit(anyOrgUnit)
            .next()

            .selectAllPeriods()
            .next()

            .selectAllAttributesCategoryOptions()
            .next()

            .next()

            .error.contains("You need to select at least one instance");
    });

    it("should have synchronize button disabled to open sync dialog", function() {
        page.search(anyDataset)
            .selectRow(anyDataset)
            .openSyncDialog()
            .syncButton.should("be.disabled");
    });

    it("should have synchronize button disabled if only contains org unit", function() {
        page.search(anyDataset)
            .selectRow(anyDataset)
            .openSyncDialog()

            .selectOrgUnit(anyOrgUnit)
            .next()

            .syncButton.should("be.disabled");
    });

    it("should have synchronize button disabled if only contains org unit and periods", function() {
        page.search(anyDataset)
            .selectRow(anyDataset)
            .openSyncDialog()

            .selectOrgUnit(anyOrgUnit)
            .next()

            .selectAllPeriods()
            .next()

            .syncButton.should("be.disabled");
    });

    it("should have synchronize button disabled if only contains org unit, periods and category options", function() {
        page.search(anyDataset)
            .selectRow(anyDataset)
            .openSyncDialog()

            .selectOrgUnit(anyOrgUnit)
            .next()

            .selectAllPeriods()
            .next()

            .selectAllAttributesCategoryOptions()
            .next()

            .syncButton.should("be.disabled");
    });

    it("should have synchronize button enabled if contains org unit, periods, category options and one instance", function() {
        page.search(anyDataset)
            .selectRow(anyDataset)
            .openSyncDialog()

            .selectOrgUnit(anyOrgUnit)
            .next()

            .selectAllPeriods()
            .next()

            .selectAllAttributesCategoryOptions()
            .next()

            .selectReceiverInstance(anyInstance)
            .syncButton.should("not.be.disabled");
    });
});
