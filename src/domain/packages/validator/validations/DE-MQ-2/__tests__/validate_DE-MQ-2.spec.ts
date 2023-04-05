import { validate_DE_MQ_2 } from "../validate_DE-MQ-2";
import DE_MQ_2_success from "./data/DE-MQ-2_success.json";
import DE_MQ_2_fail from "./data/DE-MQ-2_fail.json";

describe("validate DE_MQ_2", () => {
    it("should not return errors for empty package", () => {
        const errors = validate_DE_MQ_2({});

        expect(errors.length).toBe(0);
    });
    it("should not return errors if package is valid", () => {
        const errors = validate_DE_MQ_2(DE_MQ_2_success);

        expect(errors.length).toBe(0);
    });
    it("should return errors if package is invaid", () => {
        const errors = validate_DE_MQ_2(DE_MQ_2_fail);

        expect(errors.length).toBe(3);
        expect(errors[0]).toBe(
            "DE-MQ-2 - DataElement contains the words 'number of' (T4sd77FTesI) name=' Basic science - Research studies initiated number of'"
        );
        expect(errors[1]).toBe(
            "DE-MQ-2 - DataElement contains the words 'number of' (LLf2TlSczM5) name=' Capsules number-Adult ENL1 Number of'"
        );
        expect(errors[2]).toBe(
            "DE-MQ-2 - DataElement contains the words 'number of' (T4sd77FTesI) shortName='  Basic science - Clinical - Research studies number of'"
        );
    });
});

export {};
