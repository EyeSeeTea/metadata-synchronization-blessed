import { areCronExpressionsEqual } from "../areCronExpressionsEqual";

describe("areCronExpressionsEqual", () => {
    it("should return true for identical cron expressions", () => {
        const result = areCronExpressionsEqual("0 0 0 1 1/1 ?", "0 0 0 1 1/1 ?");
        expect(result).toBe(true);
    });

    it("should return false if fields differ", () => {
        const result = areCronExpressionsEqual("0 0 0 1 1/1 ?", "0 0 0 ? * *");
        expect(result).toBe(false);
    });
});
