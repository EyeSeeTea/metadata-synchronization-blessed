import { validate_PRV_MQ_1 } from "../validate_PRV-MQ-1";
import PRV_MQ_1_success from "./data/PRV-MQ-1_success.json";
import PRV_MQ_1_fail from "./data/PRV-MQ-1_fail.json";

describe("validate PRV-MQ-1", () => {
    it("should not return errors for empty package", () => {
        const errors = validate_PRV_MQ_1({});

        expect(errors.length).toBe(0);
    });
    it("should not return errors if package is valid", () => {
        const errors = validate_PRV_MQ_1(PRV_MQ_1_success);

        expect(errors.length).toBe(0);
    });
    it("should return errors if package is invaid", () => {
        const errors = validate_PRV_MQ_1(PRV_MQ_1_fail);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe("PRV-MQ-1 - In program auqdJ66DqAT, more than one PRV with the same name");
    });
});

export {};
