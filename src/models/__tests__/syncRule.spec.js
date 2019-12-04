import SyncRule from "../syncRule";

describe("SyncRule", () => {
    describe("create", () => {
        it("should return a SyncRule with a empty name", () => {
            const syncRule = SyncRule.create("metadata");
            expect(syncRule.name).toBe("");
        });
    });

    describe("createOnDemand", () => {
        it("should return a SyncRule with a name", () => {
            const syncRule = SyncRule.createOnDemand("metadata");
            expect(syncRule.name).not.toBe("");
        });
    });

    describe("isValid", () => {
        describe("metadata", () => {
            it("should return false when is created using create method", async () => {
                const isValid = await SyncRule.create("metadata").isValid();
                expect(isValid).toEqual(false);
            });
            it("should return false when is created using createOnDemand method", async () => {
                const isValid = await SyncRule.createOnDemand("metadata").isValid();
                expect(isValid).toEqual(false);
            });
            it("should return true when is metadata sync rule and contains name, instances and metadataIds", async () => {
                const syncRule = SyncRule.create("metadata")
                    .updateName("SyncRule test")
                    .updateMetadataIds(["zXvNvFtGwDu"])
                    .updateTargetInstances(["fP3MMoWv6qp"]);
                const isValid = await syncRule.isValid();
                expect(isValid).toEqual(true);
            });
            it("should return false when does not contains metadataIds", async () => {
                const syncRule = SyncRule.create("metadata")
                    .updateName("SyncRule test")
                    .updateTargetInstances(["fP3MMoWv6qp"]);
                const isValid = await syncRule.isValid();
                expect(isValid).toEqual(false);
            });
        });

        describe("data", () => {
            it("should return false when is created using create method", async () => {
                const isValid = await SyncRule.create("data").isValid();
                expect(isValid).toEqual(false);
            });
            it("should return false when is created using createOnDemand method", async () => {
                const isValid = await SyncRule.createOnDemand("data").isValid();
                expect(isValid).toEqual(false);
            });
            it("should return true when contains name, instances and organisationUnits", async () => {
                const syncRule = SyncRule.create("data")
                    .updateName("SyncRule test")
                    .updateDataSyncOrgUnits(["/JLA7wl59oN3/WeeW3tgF69f"])
                    .updateDataSyncStartDate(new Date())
                    .updateDataSyncEndDate(new Date())
                    .updateTargetInstances(["fP3MMoWv6qp"]);
                const isValid = await syncRule.isValid();
                expect(isValid).toEqual(true);
            });
            it("should return false when does not contains organisationUnits", async () => {
                const syncRule = SyncRule.create("data")
                    .updateName("SyncRule test")
                    .updateTargetInstances(["fP3MMoWv6qp"]);
                const isValid = await syncRule.isValid();
                expect(isValid).toEqual(false);
            });
        });
    });
});

export {};
