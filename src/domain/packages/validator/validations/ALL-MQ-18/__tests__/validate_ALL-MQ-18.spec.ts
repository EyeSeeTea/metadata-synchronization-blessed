import { validate_ALL_MQ_18 } from "../validate_ALL-MQ-18";
import ALL_MQ_18_success from "./data/ALL-MQ-18_success.json";
import ALL_MQ_18_fail_by_option from "./data/ALL-MQ-18_fail_by_option.json";
import ALL_MQ_18_fail_by_non_option from "./data/ALL-MQ-18_fail_by_non_option.json";

describe("validate ALL-MQ-18", () => {
    it("should not return errors for empty package", () => {
        const errors = validate_ALL_MQ_18({});

        expect(errors.length).toBe(0);
    });
    it("should not return errors if package is valid", () => {
        const errors = validate_ALL_MQ_18(ALL_MQ_18_success);

        expect(errors.length).toBe(0);
    });
    it("should return errors if package is invaid by option", () => {
        const errors = validate_ALL_MQ_18(ALL_MQ_18_fail_by_option);

        expect(errors.length).toBe(2);
        expect(errors[0]).toBe(
            "ALL-MQ-18- Invalid code='Lambda-cyhalothrin' (resource type='options' (name='Lambda-cyhalothrin' uid=FQN0uEwJN8C)"
        );
        expect(errors[1]).toBe(
            "ALL-MQ-18- Invalid code='Malathion' (resource type='options' (name='Malathion' uid=Yz9Z14TqC9T)"
        );
    });
    it("should return errors if package is invaid by non option", () => {
        const errors = validate_ALL_MQ_18(ALL_MQ_18_fail_by_non_option);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe(
            "ALL-MQ-18- Invalid code='fail code*' (resource type='dashboards' (name='0. Aggregate Metrics Across Facilities' uid=oarhBUuQMop)"
        );
    });
});

export {};
