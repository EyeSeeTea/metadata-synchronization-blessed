import { TEIsPackage } from "../../entities/TEIsPackage";
import { TEIsPayloadMapper } from "../TEIsPayloadMapper";

import singleTEI from "./data/TrackedEntityInstances.json";

describe("TEIsPayloadMapper", () => {
    it("should return the same payload if mapping is empty", async () => {
        const teiMapper = new TEIsPayloadMapper();

        const payload = singleTEI as TEIsPackage;

        const mappedPayload = await teiMapper.map(payload);

        expect(mappedPayload).toEqual(payload);
    });
});

export { };
