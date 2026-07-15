import { hashString } from "../hash";

describe("hashString", () => {
    it("returns the same hash for the same string", () => {
        const inputs = [
            "test",
            "users,userGroups,program,programRules",
            "categories,categoryCombo,categoryOptionCombos",
            "a",
            "-1",
            "",
            "users,userGroups,program,programRules,categoryOptionCombos,users,userGroups,program,programRules,categoryOptionCombos",
        ];
        inputs.forEach(input => {
            expect(hashString(input)).toBe(hashString(input));
        });
    });

    it("returns different hashes for different strings", () => {
        expect(hashString("test1")).not.toBe(hashString("test2"));
    });

    it("returns only numbers and lowercase letters", () => {
        const hash = hashString("abc123");
        expect(hash).toMatch(/^[a-z0-9]+$/);
    });
});
