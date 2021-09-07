import ManualAggregatedSyncPageObject from "../support/page-objects/ManualAggregatedSyncPageObject";

/**
 * Database: d2-docker-eyeseetea-2-30-datasync-sender
 */
context("Manual aggregated sync", () => {
    const page = new ManualAggregatedSyncPageObject(cy);

    const inputs = {
        orgUnit: "Ghana",
        instance: "Y5QsHDoD4I0",
        dataSet: "Malaria annual data",
    };

    beforeEach(() => {
        page.open();
    });

    it("should have the correct title", () => {
        page.assertTitle(title => title.contains("Aggregated Data Synchronization"));
    });

    it("should sync correctly malaria annual data", () => {
        page.search(inputs.dataSet)
            .selectRow(inputs.dataSet)
            .openSyncDialog()

            .selectOrgUnit(inputs.orgUnit)
            .next()

            .selectAllPeriods()
            .next()

            .selectAllAttributesCategoryOptions()
            .next()

            // Skip aggregation
            .next()

            .selectReceiverInstance(inputs.instance)
            .synchronize()

            .assertSyncResultsStatus(status => status.contains("Success"))
            .closeSyncResultsDialog();
    });

    it("should show the org unit step error if user try click on next without selecting the org unit", () => {
        page.search(inputs.dataSet)
            .selectRow(inputs.dataSet)
            .openSyncDialog()
            .next()
            .assertError(error => error.contains("You need to select at least one organisation unit"));
    });

    it("should show the instance selection step error if user try click on next without selecting an instance", () => {
        page.search(inputs.dataSet)
            .selectRow(inputs.dataSet)
            .openSyncDialog()

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

    it("should have synchronize button disabled to open sync dialog", () => {
        page.search(inputs.dataSet)
            .selectRow(inputs.dataSet)
            .openSyncDialog()
            .assertSyncButton(syncButton => syncButton.should("be.disabled"));
    });

    it("should have synchronize button disabled if only contains org unit", () => {
        page.search(inputs.dataSet)
            .selectRow(inputs.dataSet)
            .openSyncDialog()

            .selectOrgUnit(inputs.orgUnit)
            .next()

            .assertSyncButton(syncButton => syncButton.should("be.disabled"));
    });

    it("should have synchronize button disabled if only contains org unit and periods", () => {
        page.search(inputs.dataSet)
            .selectRow(inputs.dataSet)
            .openSyncDialog()

            .selectOrgUnit(inputs.orgUnit)
            .next()

            .selectAllPeriods()
            .next()

            .assertSyncButton(syncButton => syncButton.should("be.disabled"));
    });

    it("should have synchronize button disabled if only contains org unit, periods and category options", () => {
        page.search(inputs.dataSet)
            .selectRow(inputs.dataSet)
            .openSyncDialog()

            .selectOrgUnit(inputs.orgUnit)
            .next()

            .selectAllPeriods()
            .next()

            .selectAllAttributesCategoryOptions()
            .next()

            .assertSyncButton(syncButton => syncButton.should("be.disabled"));
    });

    it("should have synchronize button enabled if contains org unit, periods, category options and one instance", () => {
        page.search(inputs.dataSet)
            .selectRow(inputs.dataSet)
            .openSyncDialog()

            .selectOrgUnit(inputs.orgUnit)
            .next()

            .selectAllPeriods()
            .next()

            .selectAllAttributesCategoryOptions()
            .next()

            // Skip aggregation
            .next()

            .selectReceiverInstance(inputs.instance)

            .assertSyncButton(syncButton => syncButton.should("not.be.disabled"));
    });
});
