import { validatePackageContents } from "../packageContentValidator";
import O_MQ_2_success from "../validations/o_mq_2/__tests__/data/O_MQ_2_success.json";
import O_MQ_2_fail_by_first from "../validations/o_mq_2/__tests__/data/O_MQ_2_fail_by_first.json";
import OG_MQ_1_success from "../validations/og_mq_1/__tests__/data/OG_MQ_1_success.json";
import OG_MQ_1_fail from "../validations/og_mq_1/__tests__/data/OG_MQ_1_fail.json";
import SHST_MQ_1_success from "../validations/shst_mq_1/__tests__/data/SHST_MQ_1_success.json";
import SHST_MQ_1_fail from "../validations/shst_mq_1/__tests__/data/SHST_MQ_1_fail.json";
import ALL_MQ_16_success from "../validations/all-mq-16/__tests__/data/ALL_MQ_16_success.json";
import ALL_MQ_16_fail from "../validations/all-mq-16/__tests__/data/ALL_MQ_16_fail.json";
import ALL_MQ_19_success from "../validations/all-mq-19/__tests__/data/ALL_MQ_19_success.json";
import ALL_MQ_19_fail from "../validations/all-mq-19/__tests__/data/ALL_MQ_19_fail.json";

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
});

export {};
