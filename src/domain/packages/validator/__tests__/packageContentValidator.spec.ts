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
import PRV_MQ_2_success from "../validations/PRV-MQ-2/__tests__/data/PRV-MQ-2_success.json";
import PRV_MQ_2_fail from "../validations/PRV-MQ-2/__tests__/data/PRV-MQ-2_fail_by_and.json";
import PR_ST_4_success from "../validations/PR-ST-4/__tests__/data/PR-ST-4_success.json";
import PR_ST_4_fail from "../validations/PR-ST-4/__tests__/data/PR-ST-4_fail.json";
import PR_ST_5_success from "../validations/PR-ST-5/__tests__/data/PR-ST-5_success.json";
import PR_ST_5_fail from "../validations/PR-ST-5/__tests__/data/PR-ST-5_fail.json";
import ALL_MQ_17_success from "../validations/ALL-MQ-17/__tests__/data/ALL-MQ-17_success.json";
import ALL_MQ_17_fail from "../validations/ALL-MQ-17/__tests__/data/ALL-MQ-17_fail.json";
import ALL_MQ_18_success from "../validations/ALL-MQ-18/__tests__/data/ALL-MQ-18_success.json";
import ALL_MQ_18_fail_by_option from "../validations/ALL-MQ-18/__tests__/data/ALL-MQ-18_fail_by_option.json";
import DE_MQ_2_success from "../validations/DE-MQ-2/__tests__/data/DE-MQ-2_success.json";
import DE_MQ_2_fail from "../validations/DE-MQ-2/__tests__/data/DE-MQ-2_fail.json";
import I_MQ_3_success from "../validations/I-MQ-3/__tests__/data/I-MQ-3_success.json";
import I_MQ_3_fail from "../validations/I-MQ-3/__tests__/data/I-MQ-3_fail_by_proportion.json";
import PI_MQ_3_success from "../validations/PI-MQ-3/__tests__/data/PI-MQ-3_success.json";
import PI_MQ_3_fail from "../validations/PI-MQ-3/__tests__/data/PI-MQ-3_fail_by_proportion.json";
import ALL_MQ_20_success from "../validations/ALL-MQ-20/__tests__/data/ALL-MQ-20_success.json";
import ALL_MQ_20_fail from "../validations/ALL-MQ-20/__tests__/data/ALL-MQ-20_fail_by_program_indicator.json";

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
    describe("validate SHST-MQ-1", () => {
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
    describe("validate PRV-MQ-2", () => {
        it("should return a success for valid package", () => {
            const result = validatePackageContents(PRV_MQ_2_success);

            expect(result.isSuccess()).toBe(true);
        });
        it("should return failed for invalid package", () => {
            const result = validatePackageContents(PRV_MQ_2_fail);

            expect(result.isSuccess()).toBe(false);
        });
    });
    describe("validate PR-ST-4", () => {
        it("should return a success for valid package", () => {
            const result = validatePackageContents(PR_ST_4_success);

            expect(result.isSuccess()).toBe(true);
        });
        it("should return failed for invalid package", () => {
            const result = validatePackageContents(PR_ST_4_fail);

            expect(result.isSuccess()).toBe(false);
        });
    });
    describe("validate PR-ST-5", () => {
        it("should return a success for valid package", () => {
            const result = validatePackageContents(PR_ST_5_success);

            expect(result.isSuccess()).toBe(true);
        });
        it("should return failed for invalid package", () => {
            const result = validatePackageContents(PR_ST_5_fail);

            expect(result.isSuccess()).toBe(false);
        });
    });
    describe("validate ALL-MQ-17", () => {
        it("should return a success for valid package", () => {
            const result = validatePackageContents(ALL_MQ_17_success);

            expect(result.isSuccess()).toBe(true);
        });
        it("should return success with warnings for valid package with warnings", () => {
            const result = validatePackageContents(ALL_MQ_17_fail);

            expect(result.isSuccess()).toBe(true);

            result.match({
                error: () => fail("Should be success"),
                success: data => expect(data.warnings.length > 0).toBe(true),
            });
        });
    });
    describe("validate ALL-MQ-18", () => {
        it("should return a success for valid package", () => {
            const result = validatePackageContents(ALL_MQ_18_success);

            expect(result.isSuccess()).toBe(true);
        });
        it("should return failed for invalid package", () => {
            const result = validatePackageContents(ALL_MQ_18_fail_by_option);

            expect(result.isSuccess()).toBe(false);
        });
    });
    describe("validate DE-MQ-2", () => {
        it("should return a success for valid package", () => {
            const result = validatePackageContents(DE_MQ_2_success);

            expect(result.isSuccess()).toBe(true);
        });
        it("should return success with warnings for valid package with warnings", () => {
            const result = validatePackageContents(DE_MQ_2_fail);

            expect(result.isSuccess()).toBe(true);

            result.match({
                error: () => fail("Should be success"),
                success: data => expect(data.warnings.length > 0).toBe(true),
            });
        });
    });
    describe("validate I-MQ-3", () => {
        it("should return a success for valid package", () => {
            const result = validatePackageContents(I_MQ_3_success);

            expect(result.isSuccess()).toBe(true);
        });
        it("should return success with warnings for valid package with warnings", () => {
            const result = validatePackageContents(I_MQ_3_fail);

            expect(result.isSuccess()).toBe(true);

            result.match({
                error: () => fail("Should be success"),
                success: data => expect(data.warnings.length > 0).toBe(true),
            });
        });
    });
    describe("validate PI-MQ-3", () => {
        it("should return a success for valid package", () => {
            const result = validatePackageContents(PI_MQ_3_success);

            expect(result.isSuccess()).toBe(true);
        });
        it("should return success with warnings for valid package with warnings", () => {
            const result = validatePackageContents(PI_MQ_3_fail);

            expect(result.isSuccess()).toBe(true);

            result.match({
                error: () => fail("Should be success"),
                success: data => expect(data.warnings.length > 0).toBe(true),
            });
        });
    });
    describe("validate ALL-MQ-20", () => {
        it("should return a success for valid package", () => {
            const result = validatePackageContents(ALL_MQ_20_success);

            expect(result.isSuccess()).toBe(true);
        });
        it("should return failed for invalid package", () => {
            const result = validatePackageContents(ALL_MQ_20_fail);

            expect(result.isSuccess()).toBe(false);
        });
    });
});

export {};
