import { validate_PR_ST_5 } from "../validate_PR-ST-5";
import PR_ST_5_success from "./data/PR-ST-5_success.json";
import PR_ST_5_fail from "./data/PR-ST-5_fail.json";

describe("validate PR-ST-4", () => {
    it("should not return errors for empty package", () => {
        const errors = validate_PR_ST_5({});

        expect(errors.length).toBe(0);
    });
    it("should not return errors if package is valid", () => {
        const errors = validate_PR_ST_5(PR_ST_5_success);

        expect(errors.length).toBe(0);
    });
    it("should return errors if package is invaid", () => {
        const errors = validate_PR_ST_5(PR_ST_5_fail);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe(
            "PR-ST-5 Program Rule 'AB treatment started/completed' (Is56icDYrFf) in the PR Action uses a TEA noZbIU6sFG5 that does not belong to the associated program"
        );
    });
});

export {};
