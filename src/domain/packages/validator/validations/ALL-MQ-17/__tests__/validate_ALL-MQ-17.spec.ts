import { validate_ALL_MQ_17 } from "../validate_ALL-MQ-17";
import ALL_MQ_16_success from "./data/ALL-MQ-17_success.json";
import ALL_MQ_16_fail from "./data/ALL-MQ-17_fail.json";

describe("validate ALL-MQ-17", () => {
    it("should not return errors for empty package", () => {
        const errors = validate_ALL_MQ_17({});

        expect(errors.length).toBe(0);
    });
    it("should not return errors if package is valid", () => {
        const errors = validate_ALL_MQ_17(ALL_MQ_16_success);

        expect(errors.length).toBe(0);
    });
    it("should return errors if package is invaid", () => {
        const errors = validate_ALL_MQ_17(ALL_MQ_16_fail);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe(
            "ALL-MQ-17- Missed code field in dashboards (name='0. Aggregate Metrics Across Facilities' uid=oarhBUuQMop)"
        );
    });
});

export {};
