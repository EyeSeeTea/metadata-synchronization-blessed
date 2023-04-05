import { validate_O_MQ_2 } from "../validate_O-MQ-2";
import O_MQ_2_success from "./data/O-MQ-2_success.json";
import O_MQ_2_fail_by_first from "./data/O-MQ-2_fail_by_first.json";
import O_MQ_2_fail_by_last from "./data/O-MQ-2_fail_by_last.json";

describe("validate O-MQ-2", () => {
    it("should not return errors for empty package", () => {
        const errors = validate_O_MQ_2({});

        expect(errors.length).toBe(0);
    });
    it("should not return errors for valid options orders in the package", () => {
        const errors = validate_O_MQ_2(O_MQ_2_success);

        expect(errors.length).toBe(0);
    });
    it("should return errors for options with wrong first order in the package", () => {
        const errors = validate_O_MQ_2(O_MQ_2_fail_by_first);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe(
            "O-MQ-2 - The optionSet Bro7ItXHy5W has errors in the sortOrder. Current sortOrder: 2,3,4,7"
        );
    });
    it("should return errors for options with wrong last order in the package", () => {
        const errors = validate_O_MQ_2(O_MQ_2_fail_by_last);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe(
            "O-MQ-2 - The optionSet Bro7ItXHy5W has errors in the sortOrder. Current sortOrder: 1,2,3,8"
        );
    });
});

export {};
