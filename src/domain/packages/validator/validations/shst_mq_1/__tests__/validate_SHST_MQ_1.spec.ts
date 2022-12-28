import { validate_SHST_MQ_1 } from "../validate_SHST_MQ_1";
import SHST_MQ_1_success from "./data/SHST_MQ_1_success.json";
import SHST_MQ_1_fail from "./data/SHST_MQ_1_fail.json";

describe("validate SHST-MQ-1", () => {
    it("should not return errors for empty package", () => {
        const errors = validate_SHST_MQ_1({});

        expect(errors.length).toBe(0);
    });
    it("should not return errors if package is valid", () => {
        const errors = validate_SHST_MQ_1(SHST_MQ_1_success);

        expect(errors.length).toBe(0);
    });
    it("should return errors if package is invaid", () => {
        const errors = validate_SHST_MQ_1(SHST_MQ_1_fail);

        expect(errors.length).toBe(2);
        expect(errors[0]).toBe("SHST-MQ-1 - There is a resource with external access: Resource FQN0uEwJN8C");
        expect(errors[1]).toBe("SHST-MQ-1 - There is a resource with external access: Resource Yz9Z14TqC9T");
    });
});

export {};
