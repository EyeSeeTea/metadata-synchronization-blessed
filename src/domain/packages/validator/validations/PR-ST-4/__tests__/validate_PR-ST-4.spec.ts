import { validate_PR_ST_4 } from "../validate_PR-ST-4";
import PR_ST_4_success from "./data/PR-ST-4_success.json";
import PR_ST_4_fail from "./data/PR-ST-4_fail.json";

describe("validate PR-ST-4", () => {
    it("should not return errors for empty package", () => {
        const errors = validate_PR_ST_4({});

        expect(errors.length).toBe(0);
    });
    it("should not return errors if package is valid", () => {
        const errors = validate_PR_ST_4(PR_ST_4_success);

        expect(errors.length).toBe(0);
    });
    it("should return errors if package is invaid", () => {
        const errors = validate_PR_ST_4(PR_ST_4_fail);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe(
            "PR-ST-4 Program Rule 'AB treatment started/completed' (Is56icDYrFf) in the PR Action uses a DE noZbIU6sFG5 that does not belong to the associated program"
        );
    });
});

export {};
