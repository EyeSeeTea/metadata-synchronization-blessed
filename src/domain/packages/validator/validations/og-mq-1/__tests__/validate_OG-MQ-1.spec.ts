import { validate_OG_MQ_1 } from "../validate-OG-MQ-1";
import OG_MQ_1_success from "./data/OG-MQ-1_success.json";
import OG_MQ_1_fail from "./data/OG-MQ-1_fail.json";

describe("validate OG-MQ-1", () => {
    it("should not return errors for empty package", () => {
        const errors = validate_OG_MQ_1({});

        expect(errors.length).toBe(0);
    });
    it("should not return errors if package is valid", () => {
        const errors = validate_OG_MQ_1(OG_MQ_1_success);

        expect(errors.length).toBe(0);
    });
    it("should return errors if package is invaid", () => {
        const errors = validate_OG_MQ_1(OG_MQ_1_fail);

        expect(errors.length).toBe(2);
        expect(errors[0]).toBe("OG-MQ-1 - Option in OptionGroup but not in OptionSet. Option YtsjrR6MoXK");
        expect(errors[1]).toBe("OG-MQ-1 - Option in OptionGroup but not in OptionSet. Option u7bXEmmiZd0");
    });
});

export {};
