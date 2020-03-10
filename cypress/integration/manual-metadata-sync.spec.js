import ManualMetadataSyncPageObject from "../support/page-objects/ManualMetadataSyncPageObject";

context("Manual metadata sync", () => {
    const page = new ManualMetadataSyncPageObject(cy);

    beforeEach(() => {
        page.open();
    });

    context("Data element", () => {
        const dataElementInputs = {
            filterLabel: "Metadata type",
            filterValue: "Data Element",
            dataElement: "ENTO-ADULT- Household Head Name",
            instance: "Y5QsHDoD4I0",
        };

        it("should have the correct title", () => {
            page.assertTitle(title => title.contains("Metadata Synchronization"));
        });

        //TODO: this test is commented because some times on this page the search typing not working
        //      in cypress there are a issue for this bug https://github.com/cypress-io/cypress/issues/5480
        // it("should show correct rows after search", ()=>  {
        //     page.search(anyDataElement).selectRow(anyDataElement);
        // });

        it("should sync correctly one data element", () => {
            page.selectFilterInTable(dataElementInputs.filterLabel, dataElementInputs.filterValue)
                .selectRow(dataElementInputs.dataElement)
                .openSyncDialog()
                .next()
                .selectReceiverInstance(dataElementInputs.instance)
                .synchronize()
                .assertSyncResultsStatus(status => status.contains("Success"))
                .closeSyncResultsDialog();
        });

        it("should show the instance selection step error if user try click on next without selecting an instance", () => {
            page.selectFilterInTable(dataElementInputs.filterLabel, dataElementInputs.filterValue)
                .selectRow(dataElementInputs.dataElement)
                .openSyncDialog()
                .next()
                .next()
                .assertError(error => error.contains("You need to select at least one instance"));
        });

        it("should have synchronize button disabled to open sync dialog", () => {
            page.selectFilterInTable(dataElementInputs.filterLabel, dataElementInputs.filterValue)
                .selectRow(dataElementInputs.dataElement)
                .openSyncDialog()

                .assertSyncButton(syncButton => syncButton.should("be.disabled"));
        });

        it("should have synchronize button disabled if only contains default include exclude", () => {
            page.selectFilterInTable(dataElementInputs.filterLabel, dataElementInputs.filterValue)
                .selectRow(dataElementInputs.dataElement)
                .openSyncDialog()
                .next()
                .assertSyncButton(syncButton => syncButton.should("be.disabled"));
        });

        it("should have synchronize button enabled if contains org unit, periods, category options and one instance", () => {
            page.selectFilterInTable(dataElementInputs.filterLabel, dataElementInputs.filterValue)
                .selectRow(dataElementInputs.dataElement)
                .openSyncDialog()
                .next()
                .selectReceiverInstance(dataElementInputs.instance)
                .assertSyncButton(syncButton => syncButton.should("not.be.disabled"));
        });

        it("should sync correctly with dependencies with default include rule", () => {
            page.selectFilterInTable(dataElementInputs.filterLabel, dataElementInputs.filterValue)
                .selectRow(dataElementInputs.dataElement)
                .openSyncDialog()
                .next()

                .selectReceiverInstance(dataElementInputs.instance)
                .synchronize()

                .assertSyncResultsStatus(status => status.contains("Success"))
                .assertSyncResultsSummary(summary => summary.contains("Attribute"))
                .closeSyncResultsDialog();
        });
        it("should sync correctly without excluded dependencies if rules are customized", () => {
            page.selectFilterInTable(dataElementInputs.filterLabel, dataElementInputs.filterValue)
                .selectRow(dataElementInputs.dataElement)
                .openSyncDialog()

                .changeUseDefaultConfiguration()
                .selectMetadataType("Data Element")
                .excludeRule("Attributes")
                .next()

                .selectReceiverInstance(dataElementInputs.instance)
                .synchronize()

                .assertSyncResultsStatus(status => status.contains("Success"))
                .assertSyncResultsSummary(summary =>
                    summary.contains("Attribute").should("not.exist")
                )
                .closeSyncResultsDialog();
        });
    });
    context("Dashboard", () => {
        const dashboardInputs = {
            filterLabel: "Metadata type",
            filterValue: "Dashboard",
            dataElement: "Malaria Quality Control",
            instance: "Y5QsHDoD4I0",
        };

        it("should sync correctly one dashboard", () => {
            page.selectFilterInTable(dashboardInputs.filterLabel, dashboardInputs.filterValue)
                .selectRow(dashboardInputs.dataElement)
                .openSyncDialog()
                .next()
                .selectReceiverInstance(dashboardInputs.instance)
                .synchronize()
                .assertSyncResultsStatus(status => status.contains("Success"))
                .closeSyncResultsDialog();
        });
    });
});
