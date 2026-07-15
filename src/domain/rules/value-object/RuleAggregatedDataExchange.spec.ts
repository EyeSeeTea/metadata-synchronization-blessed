import { describe, it, expect } from "vitest";
import { RuleAggregatedDataExchange } from "./RuleAggregatedDataExchange";
import { isValidUid } from "../../common/entities/uid";

const validprops = {
    id: "A12345678901",
    target: {
        instanceId: "B12345678901",
        type: "external" as const,
        authType: "http-basic" as const,
        username: "user",
        password: "pass",
    },
};

describe("RuleAggregatedDataExchange", () => {
    describe("create", () => {
        it("Should return success with valid props", () => {
            const res = RuleAggregatedDataExchange.create(validprops);

            res.match({
                success: value => {
                    expect(value.toProps()).toEqual(validprops);
                },
                error: errors => {
                    fail(errors);
                },
            });
        });

        it("Should generate a valid id if empty string provided", () => {
            const res = RuleAggregatedDataExchange.create({
                ...validprops,
                id: "",
            });

            res.match({
                success: value => {
                    expect(isValidUid(value.id)).toBe(true);
                },
                error: errors => {
                    fail(errors);
                },
            });
        });

        it("Should return success with api-token target", () => {
            const props = {
                ...validprops,
                id: "C12345678901",
                target: {
                    instanceId: "D12345678901",
                    type: "external" as const,
                    authType: "api-token" as const,
                    token: "secret-token",
                },
            };
            const res = RuleAggregatedDataExchange.create(props);

            res.match({
                success: value => {
                    expect(value.toProps()).toEqual(props);
                },
                error: errors => {
                    fail(errors);
                },
            });
        });

        it("Should return success with internal target and no credentials", () => {
            const props = {
                id: "O12345678901",
                target: {
                    instanceId: "P12345678901",
                    type: "internal" as const,
                    authType: "http-basic" as const,
                },
            };
            const res = RuleAggregatedDataExchange.create(props);

            res.match({
                success: value => {
                    expect(value.toProps()).toEqual(props);
                },
                error: errors => {
                    fail(errors);
                },
            });
        });

        it("Should return error when missing instanceId", () => {
            const res = RuleAggregatedDataExchange.create({
                ...validprops,
                id: "E12345678901",
                target: {
                    // @ts-expect-error testing validation when instanceId is missing
                    instanceId: undefined,
                    type: "external",
                    authType: "api-token",
                    token: "t",
                },
            });

            res.match({
                success: _ => fail("expected error for missing instanceId"),
                error: errors => {
                    expect(errors.some(e => e.property === "instanceId")).toBe(true);
                },
            });
        });

        it("Should return error when http-basic without username or password", () => {
            const res = RuleAggregatedDataExchange.create({
                ...validprops,
                id: "F12345678901",
                target: {
                    instanceId: "G12345678901",
                    type: "external" as const,
                    authType: "http-basic" as const,
                    // username missing
                    // password missing
                },
            });

            res.match({
                success: _ => fail("expected error for missing username/password"),
                error: errors => {
                    expect(errors.some(e => e.property === "username")).toBe(true);
                    expect(errors.some(e => e.property === "password")).toBe(true);
                },
            });
        });

        it("Should return error when http-basic with a password but no username", () => {
            const res = RuleAggregatedDataExchange.create({
                ...validprops,
                id: "F12345678902",
                target: {
                    instanceId: "G12345678902",
                    type: "external" as const,
                    authType: "http-basic" as const,
                    password: "pass",
                    // username missing
                },
            });

            res.match({
                success: _ => fail("expected error for missing username"),
                error: errors => {
                    expect(errors.some(e => e.property === "username")).toBe(true);
                    expect(errors.some(e => e.property === "password")).toBe(false);
                },
            });
        });

        it("Should return error when api-token without token", () => {
            const res = RuleAggregatedDataExchange.create({
                ...validprops,
                id: "H12345678901",
                target: {
                    instanceId: "I12345678901",
                    type: "external" as const,
                    authType: "api-token" as const,
                },
            });

            res.match({
                success: _ => fail("expected error for missing token"),
                error: errors => {
                    expect(errors.some(e => e.property === "token")).toBe(true);
                },
            });
        });
    });

    describe("createExisted", () => {
        it("Should return success with http-basic and username only", () => {
            const props = {
                id: "J12345678901",
                target: {
                    instanceId: "K12345678901",
                    type: "external" as const,
                    authType: "http-basic" as const,
                    username: "user",
                    // password optional in createExisted
                },
            };
            const res = RuleAggregatedDataExchange.createExisted(props);

            res.match({
                success: value => {
                    expect(value.toProps()).toEqual(props);
                },
                error: errors => fail(errors),
            });
        });

        it("Should return success with internal target and no credentials", () => {
            const props = {
                id: "Q12345678901",
                target: {
                    instanceId: "R12345678901",
                    type: "internal" as const,
                    authType: "http-basic" as const,
                },
            };
            const res = RuleAggregatedDataExchange.createExisted(props);

            res.match({
                success: value => {
                    expect(value.toProps()).toEqual(props);
                },
                error: errors => fail(errors),
            });
        });

        it("Should return error when http-basic username is missing", () => {
            const res = RuleAggregatedDataExchange.createExisted({
                ...validprops,
                id: "L12345678901",
                target: {
                    instanceId: "M12345678901",
                    type: "external" as const,
                    authType: "http-basic" as const,
                    // username missing
                },
            });

            res.match({
                success: _ => fail("expected error for missing username in createExisted"),
                error: errors => {
                    expect(errors.some(e => e.property === "username")).toBe(true);
                },
            });
        });

        it("Should return error when id is empty (no autogeneration)", () => {
            const res = RuleAggregatedDataExchange.createExisted({
                ...validprops,
                id: "",
                target: {
                    instanceId: "N12345678901",
                    type: "external",
                    authType: "api-token",
                    token: "t",
                },
            });

            res.match({
                success: _ => fail("expected error because id is required in createExisted"),
                error: errors => {
                    expect(errors.some(e => e.property === "id")).toBe(true);
                },
            });
        });
    });

    describe("isMissingCredentials", () => {
        it("is false for internal targets", () => {
            const adex = RuleAggregatedDataExchange.create({
                id: "S12345678901",
                target: { instanceId: "T12345678901", type: "internal", authType: "http-basic" },
            }).getOrThrow();

            expect(adex.isMissingCredentials).toBe(false);
        });

        it("is false for external http-basic with a password", () => {
            const adex = RuleAggregatedDataExchange.create(validprops).getOrThrow();

            expect(adex.isMissingCredentials).toBe(false);
        });

        it("is true for external http-basic without a password", () => {
            const adex = RuleAggregatedDataExchange.createExisted({
                id: "U12345678901",
                target: { instanceId: "V12345678901", type: "external", authType: "http-basic", username: "user" },
            }).getOrThrow();

            expect(adex.isMissingCredentials).toBe(true);
        });

        it("is false for external api-token with a token", () => {
            const adex = RuleAggregatedDataExchange.create({
                id: "W12345678901",
                target: { instanceId: "X12345678901", type: "external", authType: "api-token", token: "secret" },
            }).getOrThrow();

            expect(adex.isMissingCredentials).toBe(false);
        });

        it("is true for external api-token without a token", () => {
            const adex = RuleAggregatedDataExchange.createExisted({
                id: "Y12345678901",
                target: { instanceId: "Z12345678901", type: "external", authType: "api-token" },
            }).getOrThrow();

            expect(adex.isMissingCredentials).toBe(true);
        });
    });
});
