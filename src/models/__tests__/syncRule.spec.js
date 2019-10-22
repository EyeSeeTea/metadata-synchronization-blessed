import SyncRule from "../syncRule";

describe("SyncRule", () => {
    describe("create", () => {
        it("should return a SyncRule with a empty name", () => {
            const syncRule = SyncRule.create();
            expect(syncRule.name).toBe("");
        });
    });
    describe("createOnDemand", () => {
        it("should return a SyncRule with a name", () => {
            const syncRule = SyncRule.createOnDemand();
            expect(syncRule.name).not.toBe("");
        });
    });
    describe("isValid", () => {
        it("should return false when is created using create method", async () => {
            const isValid = await SyncRule.create().isValid();
            expect(isValid).toEqual(false);
        });
        it("should return false when is created using createOnDemand method", async () => {
            const isValid = await SyncRule.createOnDemand().isValid();
            expect(isValid).toEqual(false);
        });
        it("should return true when contains name, instances and metadataIds", async () => {
            const syncRule = SyncRule.create()
                .updateName("SyncRule test")
                .updateMetadataIds(["zXvNvFtGwDu"])
                .updateTargetInstances(["fP3MMoWv6qp"]);
            const isValid = await syncRule.isValid();
            expect(isValid).toEqual(true);
        });
    });
});

export {};
