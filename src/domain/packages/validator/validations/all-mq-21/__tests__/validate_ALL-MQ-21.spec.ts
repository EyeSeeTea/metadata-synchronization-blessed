import { validate_ALL_MQ_21 } from "../validate_ALL-MQ-21";
import ALL_MQ_21_success from "./data/ALL-MQ-21_success.json";
import ALL_MQ_21_fail_by_missing from "./data/ALL-MQ-21_fail_by_missing.json";
import ALL_MQ_21_fail_by_unexpected_symbol from "./data/ALL-MQ-21_fail_by_unexpected_symbol.json";

describe("validate ALL-MQ-21", () => {
    it("should not return errors for empty package", () => {
        const errors = validate_ALL_MQ_21({});

        expect(errors.length).toBe(0);
    });
    it("should not return errors if package is valid", () => {
        const errors = validate_ALL_MQ_21(ALL_MQ_21_success);

        expect(errors.length).toBe(0);
    });
    it("should return errors if package is invaid by missing locale", () => {
        const errors = validate_ALL_MQ_21(ALL_MQ_21_fail_by_missing);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe(
            "ALL-MQ-21. Unexpected translation. Missing locale in translation. Resource options with UID FQN0uEwJN8C. Translation property='DESCRIPTION'"
        );
    });
    it("should return errors if package is invaid by unexpected symbol", () => {
        const errors = validate_ALL_MQ_21(ALL_MQ_21_fail_by_unexpected_symbol);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe(
            "ALL-MQ-21. Unexpected translation. Unexpected symbol in locale. Resource options with UID FQN0uEwJN8C. Translation property='DESCRIPTION'"
        );
    });
});

export {};
