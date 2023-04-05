import { validate_PI_MQ_3 } from "../validate_PI-MQ-3";
import PI_MQ_3_success from "./data/PI-MQ-3_success.json";
import PI_MQ_3_fail_by_proportion from "./data/PI-MQ-3_fail_by_proportion.json";
import PI_MQ_3_fail_by_percentage from "./data/PI-MQ-3_fail_by_percentage.json";

describe("validate PI_MQ_3", () => {
    it("should not return errors for empty package", () => {
        const errors = validate_PI_MQ_3({});

        expect(errors.length).toBe(0);
    });
    it("should not return errors if package is valid", () => {
        const errors = validate_PI_MQ_3(PI_MQ_3_success);

        expect(errors.length).toBe(0);
    });
    it("should return errors if package is invalid by proportion", () => {
        const errors = validate_PI_MQ_3(PI_MQ_3_fail_by_proportion);

        expect(errors.length).toBe(2);
        expect(errors[0]).toBe(
            "PI-MQ-3 - Indicator contains the word 'proportion' or 'percentage' (sUIOivMvDwS) name='ACL_cases_by_provenance proportion'"
        );
        expect(errors[1]).toBe(
            "PI-MQ-3 - Indicator contains the word 'proportion' or 'percentage' (sUIOivMvDwS) shortName='ACL_cases_by_provenance proportion'"
        );
    });
    it("should return errors if package is invalid by percentage", () => {
        const errors = validate_PI_MQ_3(PI_MQ_3_fail_by_percentage);

        expect(errors.length).toBe(2);
        expect(errors[0]).toBe(
            "PI-MQ-3 - Indicator contains the word 'proportion' or 'percentage' (sUIOivMvDwS) name='ACL_cases_by_provenance percentage'"
        );
        expect(errors[1]).toBe(
            "PI-MQ-3 - Indicator contains the word 'proportion' or 'percentage' (sUIOivMvDwS) shortName='ACL_cases_by_provenance percentage'"
        );
    });
});

export {};
