import { validate_ALL_MQ_16 } from "../validate_ALL_MQ_16";
import ALL_MQ_16_success from "./data/ALL_MQ_16_success.json";
import ALL_MQ_16_fail from "./data/ALL_MQ_16_fail.json";

describe("validate ALL-MQ-16", () => {
    it("should not return errors for empty package", () => {
        const errors = validate_ALL_MQ_16({});

        expect(errors.length).toBe(0);
    });
    it("should not return errors if package is valid", () => {
        const errors = validate_ALL_MQ_16(ALL_MQ_16_success);

        expect(errors.length).toBe(0);
    });
    it("should return errors if package is invaid", () => {
        const errors = validate_ALL_MQ_16(ALL_MQ_16_fail);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe(
            "ALL-MQ-16. There is a reference to users that saved the resource as favourite. Resource oarhBUuQMop."
        );
    });
});

export {};
