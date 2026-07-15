import { isEmptyContent } from "../utils";

describe("isEmptyContent", () => {
    it("should return true for null", () => {
        expect(isEmptyContent(null)).toBe(true);
    });

    it("should return true for undefined", () => {
        expect(isEmptyContent(undefined)).toBe(true);
    });

    it("should return true for primitive string", () => {
        expect(isEmptyContent("hello")).toBe(true);
    });

    it("should return true for primitive number", () => {
        expect(isEmptyContent(42)).toBe(true);
    });

    it("should return true for empty object", () => {
        expect(isEmptyContent({})).toBe(true);
    });

    it("should return true for object with empty array values", () => {
        expect(isEmptyContent({ a: [] })).toBe(true);
    });

    it("should return true for object with undefined values", () => {
        expect(isEmptyContent({ a: undefined })).toBe(true);
    });

    it("should return true for object with null values", () => {
        expect(isEmptyContent({ a: null })).toBe(true);
    });

    it("should return true for object with empty nested object", () => {
        expect(isEmptyContent({ a: {} })).toBe(true);
    });

    it("should return false for object with non-empty array", () => {
        expect(isEmptyContent({ a: [1] })).toBe(false);
    });

    it("should return false for object with non-empty nested object", () => {
        expect(isEmptyContent({ a: { b: 1 } })).toBe(false);
    });

    it("should return true when all values are empty", () => {
        expect(isEmptyContent({ a: [], b: undefined, c: null, d: {} })).toBe(true);
    });

    it("should return false when at least one value is non-empty", () => {
        expect(isEmptyContent({ a: [], b: [1] })).toBe(false);
    });
});
