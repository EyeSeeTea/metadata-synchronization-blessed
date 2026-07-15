import { getPageCount, getRemainingPages } from "../pagination";

describe("getPageCount", () => {
    it("should return 0 when total is 0, null or undefined", () => {
        expect(getPageCount({ pageSize: 10, total: 0 })).toBe(0);
        expect(getPageCount({ pageSize: 10, total: undefined })).toBe(0);
        expect(getPageCount({ pageSize: 10, total: null as any })).toBe(0);
    });

    it("should return 0 when pageSize is 0", () => {
        expect(getPageCount({ pageSize: 0, total: 10 })).toBe(0);
    });

    it("should calculate correct page count for exact division", () => {
        expect(getPageCount({ pageSize: 10, total: 10 })).toBe(1);
        expect(getPageCount({ pageSize: 250, total: 250 })).toBe(1);
        expect(getPageCount({ pageSize: 250, total: 1000 })).toBe(4);
    });

    it("should calculate correct page count for non-exact division", () => {
        expect(getPageCount({ pageSize: 3, total: 10 })).toBe(4);
        expect(getPageCount({ pageSize: 250, total: 251 })).toBe(2);
        expect(getPageCount({ pageSize: 250, total: 420 })).toBe(2);
        expect(getPageCount({ pageSize: 250, total: 42 })).toBe(1);
        expect(getPageCount({ pageSize: 250, total: 1 })).toBe(1);
        expect(getPageCount({ pageSize: 250, total: 500 })).toBe(2);
        expect(getPageCount({ pageSize: 250, total: 501 })).toBe(3);
    });

    it("should return pageCount if provided, regardless of total and pageSize", () => {
        expect(getPageCount({ pageSize: 10, total: 100, pageCount: 5 })).toBe(5);
        expect(getPageCount({ pageSize: 0, total: 0, pageCount: 3 })).toBe(3);
        expect(getPageCount({ pageSize: 50, pageCount: 10 })).toBe(10);
        expect(getPageCount({ pageSize: 50, total: 1012, pageCount: 0 })).toBe(0);
    });
});

describe("getRemainingPages", () => {
    it("should return empty array when pageCount < 2 (total 0 or undefined)", () => {
        expect(getRemainingPages({ pageSize: 10, total: 0 })).toEqual([]);
        expect(getRemainingPages({ pageSize: 10, total: 9 })).toEqual([]);
        expect(getRemainingPages({ pageSize: 10, total: 1, pageCount: 1 })).toEqual([]);
        expect(getRemainingPages({ pageSize: 0, total: 0, pageCount: 1 })).toEqual([]);
        expect(getRemainingPages({ pageSize: 0, total: 0, pageCount: 0 })).toEqual([]);
    });

    it("should return correct remaining pages when pageCount is provided", () => {
        expect(getRemainingPages({ pageSize: 10, total: 100, pageCount: 5 })).toEqual([2, 3, 4, 5]);
        expect(getRemainingPages({ pageSize: 0, total: 0, pageCount: 3 })).toEqual([2, 3]);
        expect(getRemainingPages({ pageSize: 0, pageCount: 9 })).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it("should calculate remaining pages from total and pageSize when pageCount not provided", () => {
        expect(getRemainingPages({ pageSize: 250, total: 500 })).toEqual([2]);
        expect(getRemainingPages({ pageSize: 250, total: 501 })).toEqual([2, 3]);
        expect(getRemainingPages({ pageSize: 250, total: 750 })).toEqual([2, 3]);
        expect(getRemainingPages({ pageSize: 250, total: 999 })).toEqual([2, 3, 4]);
    });
});
