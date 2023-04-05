import { validate_ALL_MQ_20 } from "../validate_ALL-MQ-20";
import ALL_MQ_20_success from "./data/ALL-MQ-20_success.json";
import ALL_MQ_20_fail_by_program_indicator from "./data/ALL-MQ-20_fail_by_program_indicator.json";
import ALL_MQ_20_fail_by_program_rule from "./data/ALL-MQ-20_fail_by_program_rule.json";
import ALL_MQ_20_fail_by_program_rule_action from "./data/ALL-MQ-20_fail_by_program_rule_action.json";

describe("validate ALL-MQ-20", () => {
    it("should not return errors for empty package", () => {
        const errors = validate_ALL_MQ_20({});

        expect(errors.length).toBe(0);
    });
    it("should not return errors if package is valid", () => {
        const errors = validate_ALL_MQ_20(ALL_MQ_20_success);

        expect(errors.length).toBe(0);
    });
    it("should return errors if package is invalid by program indicator", () => {
        const errors = validate_ALL_MQ_20(ALL_MQ_20_fail_by_program_indicator);

        expect(errors.length).toBe(2);
        expect(errors[0]).toBe(
            "ALL-MQ-20 From program 'w9hSFsNr3Vh', the PI 'ACL_cases_by_provenance proportion' (sUIOivMvDwS) contains 'program_stage_name' in the filter."
        );
        expect(errors[1]).toBe(
            "ALL-MQ-20 From program 'w9hSFsNr3Vh', the PI 'ACL_cases_by_provenance proportion' (sUIOivMvDwS) contains 'program_stage_name' in the expression."
        );
    });
    it("should return errors if package is invalid by program rule", () => {
        const errors = validate_ALL_MQ_20(ALL_MQ_20_fail_by_program_rule);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe(
            "ALL-MQ-20 From program 'AODL0NZqmGx', the PR 'AB treatment started/completed' (Is56icDYrFf) contains 'program_stage_name' in the condition."
        );
    });
    it("should return errors if package is invalid by program rule action", () => {
        const errors = validate_ALL_MQ_20(ALL_MQ_20_fail_by_program_rule_action);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe(
            "ALL-MQ-20 From programRule 'KIoIZW3dPqB', the PRA 'undefined' (ADff4Dpbiqp) contains 'program_stage_name' in the data."
        );
    });
});

export {};
