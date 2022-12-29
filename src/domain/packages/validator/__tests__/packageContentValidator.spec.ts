import { validatePackageContents } from "../packageContentValidator";
import O_MQ_2_success from "../validations/O-MQ-2/__tests__/data/O-MQ-2_success.json";
import O_MQ_2_fail_by_first from "../validations/O-MQ-2/__tests__/data/O-MQ-2_fail_by_first.json";
import OG_MQ_1_success from "../validations/OG-MQ-1/__tests__/data/OG-MQ-1_success.json";
import OG_MQ_1_fail from "../validations/OG-MQ-1/__tests__/data/OG-MQ-1_fail.json";
import SHST_MQ_1_success from "../validations/SHST-MQ-1/__tests__/data/SHST-MQ-1_success.json";
import SHST_MQ_1_fail from "../validations/SHST-MQ-1/__tests__/data/SHST-MQ-1_fail.json";
import ALL_MQ_16_success from "../validations/ALL-MQ-16/__tests__/data/ALL-MQ-16_success.json";
import ALL_MQ_16_fail from "../validations/ALL-MQ-16/__tests__/data/ALL-MQ-16_fail.json";
import ALL_MQ_19_success from "../validations/ALL-MQ-19/__tests__/data/ALL-MQ-19_success.json";
import ALL_MQ_19_fail from "../validations/ALL-MQ-19/__tests__/data/ALL-MQ-19_fail.json";
import ALL_MQ_21_success from "../validations/ALL-MQ-21/__tests__/data/ALL-MQ-21_success.json";
import ALL_MQ_21_fail_by_missing from "../validations/ALL-MQ-21/__tests__/data/ALL-MQ-21_fail_by_missing.json";
import PR_ST_3_success from "../validations/PR-ST-3/__tests__/data/PR-ST-3_success.json";
import PR_ST_3_fail from "../validations/PR-ST-3/__tests__/data/PR-ST-3_fail.json";
import PRV_MQ_1_success from "../validations/PRV-MQ-1/__tests__/data/PRV-MQ-1_success.json";
import PRV_MQ_1_fail from "../validations/PRV-MQ-1/__tests__/data/PRV-MQ-1_fail.json";

describe("Package contents validator", () => {
    describe("validate O-MQ-2", () => {
        it("should return success for valid package", () => {
            const result = validatePackageContents(O_MQ_2_success);

            expect(result.isSuccess()).toBe(true);
        });
        it("should return failed for invalid package", () => {
            const result = validatePackageContents(O_MQ_2_fail_by_first);

            expect(result.isSuccess()).toBe(false);
        });
    });
    describe("validate OG_MQ_1", () => {
        it("should return a success for valid package", () => {
            const result = validatePackageContents(OG_MQ_1_success);

            expect(result.isSuccess()).toBe(true);
        });
        it("should return failed for invalid package", () => {
            const result = validatePackageContents(OG_MQ_1_fail);

            expect(result.isSuccess()).toBe(false);
        });
    });
    describe("validate ALL-MQ-16", () => {
        it("should return a success for valid package", () => {
            const result = validatePackageContents(SHST_MQ_1_success);

            expect(result.isSuccess()).toBe(true);
        });
        it("should return failed for invalid package", () => {
            const result = validatePackageContents(SHST_MQ_1_fail);

            expect(result.isSuccess()).toBe(false);
        });
    });
    describe("validate ALL-MQ-16", () => {
        it("should return a success for valid package", () => {
            const result = validatePackageContents(ALL_MQ_16_success);

            expect(result.isSuccess()).toBe(true);
        });
        it("should return failed for invalid package", () => {
            const result = validatePackageContents(ALL_MQ_16_fail);

            expect(result.isSuccess()).toBe(false);
        });
    });
    describe("validate ALL-MQ-19", () => {
        it("should return a success for valid package", () => {
            const result = validatePackageContents(ALL_MQ_19_success);

            expect(result.isSuccess()).toBe(true);
        });
        it("should return failed for invalid package", () => {
            const result = validatePackageContents(ALL_MQ_19_fail);

            expect(result.isSuccess()).toBe(false);
        });
    });
    describe("validate ALL-MQ-21", () => {
        it("should return a success for valid package", () => {
            const result = validatePackageContents(ALL_MQ_21_success);

            expect(result.isSuccess()).toBe(true);
        });
        it("should return failed for invalid package", () => {
            const result = validatePackageContents(ALL_MQ_21_fail_by_missing);

            expect(result.isSuccess()).toBe(false);
        });
    });
    describe("validate PR-ST-3", () => {
        it("should return a success for valid package", () => {
            const result = validatePackageContents(PR_ST_3_success);

            expect(result.isSuccess()).toBe(true);
        });
        it("should return failed for invalid package", () => {
            const result = validatePackageContents(PR_ST_3_fail);

            expect(result.isSuccess()).toBe(false);
        });
    });
    describe("validate PRV-MQ-1", () => {
        it("should return a success for valid package", () => {
            const result = validatePackageContents(PRV_MQ_1_success);

            expect(result.isSuccess()).toBe(true);
        });
        it("should return failed for invalid package", () => {
            const result = validatePackageContents(PRV_MQ_1_fail);

            expect(result.isSuccess()).toBe(false);
        });
    });
});

export {};
