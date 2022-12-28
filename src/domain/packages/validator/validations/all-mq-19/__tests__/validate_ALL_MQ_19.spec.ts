import { validate_ALL_MQ_19 } from "../validate_ALL_MQ_19";
import ALL_MQ_19_success from "./data/ALL_MQ_19_success.json";
import ALL_MQ_19_fail from "./data/ALL_MQ_19_fail.json";

describe("validate ALL-MQ-19", () => {
    it("should not return errors for empty package", () => {
        const errors = validate_ALL_MQ_19({});

        expect(errors.length).toBe(0);
    });
    it("should not return errors if package is valid", () => {
        const errors = validate_ALL_MQ_19(ALL_MQ_19_success);

        expect(errors.length).toBe(0);
    });
    it("should return errors if package is invaid", () => {
        const errors = validate_ALL_MQ_19(ALL_MQ_19_fail);

        expect(errors.length).toBe(1);
        expect(errors[0]).toBe(
            "ALL-MQ-19. Translation duplicated. Resource options with UID FQN0uEwJN8C. Translation property='DESCRIPTION' locale='es'"
        );
    });
});

export {};
