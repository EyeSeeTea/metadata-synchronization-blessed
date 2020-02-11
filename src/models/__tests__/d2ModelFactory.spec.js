import { d2ModelFactory } from "../d2ModelFactory";
import { DataElementGroupModel } from "../d2Model";

describe("d2ModelFactory", () => {
    describe("d2ModelFactory should return specific model", () => {
        it("DataElementGroup", async () => {
            const apiStub = { models: { dataElementGroups: { modelName: "dataElementGroups" } } };
            const d2Model = d2ModelFactory(apiStub, "dataElementGroups");
            expect(d2Model).toEqual(DataElementGroupModel);
        });
    });
});

export {};
