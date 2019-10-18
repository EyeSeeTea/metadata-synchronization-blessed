import { d2ModelFactory } from "../d2ModelFactory";
import { DataElementGroupModel } from "../d2Model";

describe("d2ModelFactory", () => {
    describe("d2ModelFactory should return specific model", () => {
        it("DataElementGroup", async () => {
            const d2Stub = { models: { dataElementGroups: { name: "dataElementGroup" } } };

            const d2Model = d2ModelFactory(d2Stub, "dataElementGroups");

            expect(d2Model).toEqual(DataElementGroupModel);
        });
    });
});

export {};
