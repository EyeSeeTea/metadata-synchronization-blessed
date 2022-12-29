import { validate_PRV_MQ_2 } from "../validate_PRV-MQ-2";
import PRV_MQ_2_success from "./data/PRV-MQ-2_success.json";
import PRV_MQ_2_fail_by_and from "./data/PRV-MQ-2_fail_by_and.json";
import PRV_MQ_2_fail_by_or from "./data/PRV-MQ-2_fail_by_or.json";
import PRV_MQ_2_fail_by_not from "./data/PRV-MQ-2_fail_by_not.json";
import PRV_MQ_2_fail_by_unexpected_characters from "./data/PRV-MQ-2_fail_by_unexpected_characters.json";

describe("validate PRV-MQ-1", () => {
    it("should not return errors for empty package", () => {
        const errors = validate_PRV_MQ_2({});

        expect(errors.length).toBe(0);
    });
    it("should not return errors if package is valid", () => {
        const errors = validate_PRV_MQ_2(PRV_MQ_2_success);

        expect(errors.length).toBe(0);
    });

    it("should return errors if package is invaid by and", () => {
        const errors = validate_PRV_MQ_2(PRV_MQ_2_fail_by_and);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe(
            "PRV-MQ-2: The PRV 'ETA_EUMedicationsanFluids_EVENT and' (HDBv55QSK1k) contains 'and/or/not'"
        );
    });
    it("should return errors if package is invaid by or", () => {
        const errors = validate_PRV_MQ_2(PRV_MQ_2_fail_by_or);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe(
            "PRV-MQ-2: The PRV 'ETA_EUMedicationsanFluids_EVENT or' (HDBv55QSK1k) contains 'and/or/not'"
        );
    });
    it("should return errors if package is invaid by not", () => {
        const errors = validate_PRV_MQ_2(PRV_MQ_2_fail_by_not);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe(
            "PRV-MQ-2: The PRV 'ETA_EUMedicationsanFluids_EVENT not' (HDBv55QSK1k) contains 'and/or/not'"
        );
    });
    it("should return errors if package is invaid by unexpected characters", () => {
        const errors = validate_PRV_MQ_2(PRV_MQ_2_fail_by_unexpected_characters);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe(
            "PRV-MQ-2: The PRV 'ETA_EUMedicationsanFluids_EVENT */=' (HDBv55QSK1k) contains unexpected characters"
        );
    });
});

export {};
