import { validatePackageContents } from "../packageContentValidator";
import O_MQ_2_success from "../validations/o_mq_2/__tests__/data/O_MQ_2_success.json";

describe("Package contents validator", () => {
    describe("validate O-MQ-2", () => {
        it("should return a success for valid package", () => {
            const result = validatePackageContents(O_MQ_2_success);

            expect(result.isSuccess()).toBe(true);
        });
    });
});

export {};
