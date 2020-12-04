import { Period } from "../Period";

describe("Period", () => {
    it("should return success creating from a non fixed type", () => {
        const periodResult = Period.create({ type: "LAST_WEEK" });

        periodResult.match({
            error: errors => fail(errors),
            success: period => expect(period.type).toEqual("LAST_WEEK"),
        });
    });
    it("should return success creating from a fixed type with start date and end date", () => {
        const today = new Date();
        const tomorrow = new Date(today.getDate() + 1);
        const periodResult = Period.create({ type: "FIXED", startDate: today, endDate: tomorrow });

        periodResult.match({
            error: errors => fail(errors),
            success: period => {
                expect(period.type).toEqual("FIXED");
                expect(period.startDate).toEqual(today);
                expect(period.endDate).toEqual(tomorrow);
            },
        });
    });
    it("should return error creating from a fixed type with start date and end date without value", () => {
        const periodResult = Period.create({ type: "FIXED" });

        periodResult.match({
            error: errors => {
                expect(errors.length).toBe(2);
                expect(errors[0].error).toBe("cannot_be_blank");
                expect(errors[0].property).toBe("startDate");
                expect(errors[1].error).toBe("cannot_be_blank");
                expect(errors[1].property).toBe("endDate");
            },
            success: () => fail("should be fail"),
        });
    });
    it("should return error creating from a fixed type with start date without value", () => {
        const today = new Date();
        const tomorrow = new Date(today.getDate() + 1);
        const periodResult = Period.create({ type: "FIXED", endDate: tomorrow });

        periodResult.match({
            error: errors => {
                expect(errors.length).toBe(1);
                expect(errors[0].property).toBe("startDate");
                expect(errors[0].error).toBe("cannot_be_blank");
            },
            success: () => fail("should be fail"),
        });
    });
    it("should return error creating from a fixed type with end date without value", () => {
        const today = new Date();
        const periodResult = Period.create({ type: "FIXED", startDate: today });

        periodResult.match({
            error: errors => {
                expect(errors.length).toBe(1);
                expect(errors[0].property).toBe("endDate");
                expect(errors[0].error).toBe("cannot_be_blank");
            },
            success: () => fail("should be fail"),
        });
    });
});
