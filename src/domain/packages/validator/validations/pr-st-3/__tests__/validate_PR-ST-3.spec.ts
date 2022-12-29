import { validate_PR_ST_3 } from "../validate_PR-ST-3";
import PR_ST_3_success from "./data/PR-ST-3_success.json";
import PR_ST_3_fail from "./data/PR-ST-3_fail.json";

describe("validate PR-ST-3", () => {
    it("should not return errors for empty package", () => {
        const errors = validate_PR_ST_3({});

        expect(errors.length).toBe(0);
    });
    it("should not return errors if package is valid", () => {
        const errors = validate_PR_ST_3(PR_ST_3_success);

        expect(errors.length).toBe(0);
    });
    it("should return errors if package is invaid", () => {
        const errors = validate_PR_ST_3(PR_ST_3_fail);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe("PR-ST-3 Program Rule Is56icDYrFf without Program Rule Action Program");
    });
});

export {};
