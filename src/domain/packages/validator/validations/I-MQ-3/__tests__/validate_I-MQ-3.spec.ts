import { validate_I_MQ_3 } from "../validate_I-MQ-3";
import I_MQ_3_success from "./data/I-MQ-3_success.json";
import I_MQ_3_fail_by_proportion from "./data/I-MQ-3_fail_by_proportion.json";
import I_MQ_3_fail_by_percentage from "./data/I-MQ-3_fail_by_percentage.json";

describe("validate I_MQ_3", () => {
    it("should not return errors for empty package", () => {
        const errors = validate_I_MQ_3({});

        expect(errors.length).toBe(0);
    });
    it("should not return errors if package is valid", () => {
        const errors = validate_I_MQ_3(I_MQ_3_success);

        expect(errors.length).toBe(0);
    });
    it("should return errors if package is invalid by proportion", () => {
        const errors = validate_I_MQ_3(I_MQ_3_fail_by_proportion);

        expect(errors.length).toBe(2);
        expect(errors[0]).toBe(
            "I-MQ-3 - Indicator contains the word 'proportion' or 'percentage' (EvWlGCjCqhl) name=' HEP_CASCADE_NewlyStartedTreatmentAmongPersonsWhoInjectedDrugs Proportion'"
        );
        expect(errors[1]).toBe(
            "I-MQ-3 - Indicator contains the word 'proportion' or 'percentage' (EvWlGCjCqhl) shortName=' HEP_CASCADE_NewlyStartedTreatmentAmongPersonsWhoInjectedDrugs Proportion'"
        );
    });
    it("should return errors if package is invalid by percentage", () => {
        const errors = validate_I_MQ_3(I_MQ_3_fail_by_percentage);

        expect(errors.length).toBe(2);
        expect(errors[0]).toBe(
            "I-MQ-3 - Indicator contains the word 'proportion' or 'percentage' (EvWlGCjCqhl) name=' HEP_CASCADE_NewlyStartedTreatmentAmongPersonsWhoInjectedDrugs percentage'"
        );
        expect(errors[1]).toBe(
            "I-MQ-3 - Indicator contains the word 'proportion' or 'percentage' (EvWlGCjCqhl) shortName=' HEP_CASCADE_NewlyStartedTreatmentAmongPersonsWhoInjectedDrugs percentage'"
        );
    });
});

export {};
