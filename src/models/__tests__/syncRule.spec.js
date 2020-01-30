import SyncRule from "../syncRule";
import { DataElementModel, IndicatorModel } from "../d2Model";

describe("SyncRule", () => {
    describe("create", () => {
        it("should return a SyncRule with a empty name", () => {
            const syncRule = SyncRule.create("metadata");
            expect(syncRule.name).toBe("");
        });
    });

    describe("createOnDemand", () => {
        it("should return a SyncRule with a name", () => {
            const syncRule = SyncRule.createOnDemand("metadata");
            expect(syncRule.name).not.toBe("");
        });
    });

    describe("isValid", () => {
        describe("metadata", () => {
            it("should return false when is created using create method", async () => {
                const isValid = await SyncRule.create("metadata").isValid();
                expect(isValid).toEqual(false);
            });
            it("should return false when is created using createOnDemand method", async () => {
                const isValid = await SyncRule.createOnDemand("metadata").isValid();
                expect(isValid).toEqual(false);
            });
            it("should return true when is metadata sync rule and contains name, instances and metadataIds", async () => {
                const syncRule = SyncRule.create("metadata")
                    .updateName("SyncRule test")
                    .updateMetadataIds(["zXvNvFtGwDu"])
                    .updateTargetInstances(["fP3MMoWv6qp"]);
                const isValid = await syncRule.isValid();
                expect(isValid).toEqual(true);
            });
            it("should return false when does not contains metadataIds", async () => {
                const syncRule = SyncRule.create("metadata")
                    .updateName("SyncRule test")
                    .updateTargetInstances(["fP3MMoWv6qp"]);
                const isValid = await syncRule.isValid();
                expect(isValid).toEqual(false);
            });
        });

        describe("data", () => {
            it("should return false when is created using create method", async () => {
                const isValid = await SyncRule.create("data").isValid();
                expect(isValid).toEqual(false);
            });
            it("should return false when is created using createOnDemand method", async () => {
                const isValid = await SyncRule.createOnDemand("data").isValid();
                expect(isValid).toEqual(false);
            });
            it("should return true when contains name, instances and organisationUnits", async () => {
                const syncRule = SyncRule.create("data")
                    .updateName("SyncRule test")
                    .updateMetadataIds(["dataElement"])
                    .updateDataSyncOrgUnitPaths(["/JLA7wl59oN3/WeeW3tgF69f"])
                    .updateDataSyncStartDate(new Date())
                    .updateDataSyncEndDate(new Date())
                    .updateTargetInstances(["fP3MMoWv6qp"]);
                const isValid = await syncRule.isValid();
                expect(isValid).toEqual(true);
            });
            it("should return false when does not contains organisationUnits", async () => {
                const syncRule = SyncRule.create("data")
                    .updateName("SyncRule test")
                    .updateTargetInstances(["fP3MMoWv6qp"]);
                const isValid = await syncRule.isValid();
                expect(isValid).toEqual(false);
            });
        });
    });

    describe("change useDefaultIncludeExclude", () => {
        it("should reset to empty existed exclude include rules if set to true", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules();

            const editedSyncRule = syncRule.markToUseDefaultIncludeExclude();

            expect(editedSyncRule.useDefaultIncludeExclude).toEqual(true);
            expect(editedSyncRule.metadataExcludeIncludeRules).toEqual({});
        });
        it("should assign default exclude include rules in models if set to false", () => {
            const syncRule = givenASyncRuleWithoutMetadataIncludeExcludeRules();

            const editedSyncRule = syncRule.markToNotUseDefaultIncludeExclude([
                DataElementModel,
                IndicatorModel,
            ]);

            expect(editedSyncRule.useDefaultIncludeExclude).toEqual(false);
            expect(editedSyncRule.metadataExcludeIncludeRules).toEqual({
                indicator: {
                    includeRules: [
                        "attributes",
                        "legendSets",
                        "indicatorType",
                        "indicatorGroups",
                        "indicatorGroups.attributes",
                        "indicatorGroups.indicatorGroupSet",
                    ],
                    excludeRules: ["dataSets", "programs"],
                },
                dataElement: {
                    includeRules: [
                        "attributes",
                        "dataSets",
                        "legendSets",
                        "optionSets",
                        "optionSets.options",
                        "categoryCombos",
                        "categoryCombos.attributes",
                        "categoryCombos.categoryOptionCombos",
                        "categoryCombos.categoryOptionCombos.categoryOptions",
                        "categoryCombos.categories",
                        "dataElementGroups",
                        "dataElementGroups.attributes",
                        "dataElementGroups.dataElementGroupSets",
                        "dataElementGroups.dataElementGroupSets.attributes",
                    ],
                    excludeRules: [],
                },
            });
        });
    });

    describe("change metadataId", () => {
        it("should reset to empty exclude include rules if really has changed", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules();

            const editedSyncRule = syncRule.updateMetadataIds(["newId1", "newId2"]);

            expect(editedSyncRule.useDefaultIncludeExclude).toEqual(true);
            expect(editedSyncRule.metadataExcludeIncludeRules).toEqual({});
        });
        it("should not reset exclude include rules if really has not changed", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules();

            const editedSyncRule = syncRule.updateMetadataIds(syncRule.metadataIds);

            expect(editedSyncRule.useDefaultIncludeExclude).toEqual(
                syncRule.useDefaultIncludeExclude
            );
            expect(editedSyncRule.metadataExcludeIncludeRules).toEqual(
                syncRule.metadataExcludeIncludeRules
            );
        });
    });

    describe("moveRuleFromExcludeToInclude", () => {
        it("should add the rule to include and to remove it from exclude if select only one to move", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules();

            const editedSyncRule = syncRule.moveRuleFromExcludeToInclude("organisationUnit", [0]);

            const expectedMetadataIncludeExcludeRules = {
                organisationUnit: {
                    includeRules: ["legendSets", "dataSets", "programs", "users", "attributes"],
                    excludeRules: [
                        "organisationUnitGroups",
                        "organisationUnitGroups.attributes",
                        "organisationUnitGroups.organisationUnitGroupSets",
                        "organisationUnitGroups.organisationUnitGroupSets.attributes",
                    ],
                },
                indicators: {
                    includeRules: ["attributes", "legendSets"],
                    excludeRules: ["dataSets", "programs"],
                },
            };

            expect(editedSyncRule.metadataExcludeIncludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
        it("should add the rule and parent to include and to remove it from exclude list if select only one but with parent to move", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules();

            const editedSyncRule = syncRule.moveRuleFromExcludeToInclude("organisationUnit", [2]);

            const expectedMetadataIncludeExcludeRules = {
                organisationUnit: {
                    includeRules: [
                        "legendSets",
                        "dataSets",
                        "programs",
                        "users",
                        "organisationUnitGroups.attributes",
                        "organisationUnitGroups",
                    ],
                    excludeRules: [
                        "attributes",
                        "organisationUnitGroups.organisationUnitGroupSets",
                        "organisationUnitGroups.organisationUnitGroupSets.attributes",
                    ],
                },
                indicators: {
                    includeRules: ["attributes", "legendSets"],
                    excludeRules: ["dataSets", "programs"],
                },
            };

            expect(editedSyncRule.metadataExcludeIncludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
        it("should add the rule and parents to include and to remove it from exclude list if select only one but with parents to move", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules();

            const editedSyncRule = syncRule.moveRuleFromExcludeToInclude("organisationUnit", [4]);

            const expectedMetadataIncludeExcludeRules = {
                organisationUnit: {
                    includeRules: [
                        "legendSets",
                        "dataSets",
                        "programs",
                        "users",
                        "organisationUnitGroups.organisationUnitGroupSets.attributes",
                        "organisationUnitGroups.organisationUnitGroupSets",
                        "organisationUnitGroups",
                    ],
                    excludeRules: ["attributes", "organisationUnitGroups.attributes"],
                },
                indicators: {
                    includeRules: ["attributes", "legendSets"],
                    excludeRules: ["dataSets", "programs"],
                },
            };

            expect(editedSyncRule.metadataExcludeIncludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
        it("should add the rules to include and to remove it from exclude if select more of one to move", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules();

            const editedSyncRule = syncRule.moveRuleFromExcludeToInclude("organisationUnit", [
                0,
                1,
            ]);

            const expectedMetadataIncludeExcludeRules = {
                organisationUnit: {
                    includeRules: [
                        "legendSets",
                        "dataSets",
                        "programs",
                        "users",
                        "attributes",
                        "organisationUnitGroups",
                    ],
                    excludeRules: [
                        "organisationUnitGroups.attributes",
                        "organisationUnitGroups.organisationUnitGroupSets",
                        "organisationUnitGroups.organisationUnitGroupSets.attributes",
                    ],
                },
                indicators: {
                    includeRules: ["attributes", "legendSets"],
                    excludeRules: ["dataSets", "programs"],
                },
            };

            expect(editedSyncRule.metadataExcludeIncludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
        it("should add the rules from include and to remove it to exclude without duplicates if select parent and children to move", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules();

            const editedSyncRule = syncRule.moveRuleFromExcludeToInclude("organisationUnit", [
                1,
                3,
                4,
            ]);

            const expectedMetadataIncludeExcludeRules = {
                organisationUnit: {
                    includeRules: [
                        "legendSets",
                        "dataSets",
                        "programs",
                        "users",
                        "organisationUnitGroups",
                        "organisationUnitGroups.organisationUnitGroupSets",
                        "organisationUnitGroups.organisationUnitGroupSets.attributes",
                    ],
                    excludeRules: ["attributes", "organisationUnitGroups.attributes"],
                },
                indicators: {
                    includeRules: ["attributes", "legendSets"],
                    excludeRules: ["dataSets", "programs"],
                },
            };

            expect(editedSyncRule.metadataExcludeIncludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
        it("should add the rule from include and to remove it to exclude without duplicates if select children with parent to move and parent exists in include", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules();

            const editedSyncRule1 = syncRule.moveRuleFromExcludeToInclude("organisationUnit", [1]);
            const editedSyncRule2 = editedSyncRule1.moveRuleFromExcludeToInclude(
                "organisationUnit",
                [1]
            );

            const expectedMetadataIncludeExcludeRules = {
                organisationUnit: {
                    includeRules: [
                        "legendSets",
                        "dataSets",
                        "programs",
                        "users",
                        "organisationUnitGroups",
                        "organisationUnitGroups.attributes",
                    ],
                    excludeRules: [
                        "attributes",
                        "organisationUnitGroups.organisationUnitGroupSets",
                        "organisationUnitGroups.organisationUnitGroupSets.attributes",
                    ],
                },
                indicators: {
                    includeRules: ["attributes", "legendSets"],
                    excludeRules: ["dataSets", "programs"],
                },
            };

            expect(editedSyncRule2.metadataExcludeIncludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
    });

    describe("moveRuleFromIncludeToExclude", () => {
        it("should remove the rule from include and to add it to exclude if select only one to move", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules();

            const editedSyncRule = syncRule.moveRuleFromIncludeToExclude("organisationUnit", [0]);

            const expectedMetadataIncludeExcludeRules = {
                organisationUnit: {
                    includeRules: ["dataSets", "programs", "users"],
                    excludeRules: [
                        "attributes",
                        "organisationUnitGroups",
                        "organisationUnitGroups.attributes",
                        "organisationUnitGroups.organisationUnitGroupSets",
                        "organisationUnitGroups.organisationUnitGroupSets.attributes",
                        "legendSets",
                    ],
                },
                indicators: {
                    includeRules: ["attributes", "legendSets"],
                    excludeRules: ["dataSets", "programs"],
                },
            };

            expect(editedSyncRule.metadataExcludeIncludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
        it("should remove the rule and child from include and to add it to exclude if select only one but with a child to move", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules(false);

            const editedSyncRule = syncRule.moveRuleFromIncludeToExclude("organisationUnit", [3]);

            const expectedMetadataIncludeExcludeRules = {
                organisationUnit: {
                    includeRules: [
                        "attributes",
                        "organisationUnitGroups",
                        "organisationUnitGroups.attributes",
                    ],
                    excludeRules: [
                        "legendSets",
                        "dataSets",
                        "programs",
                        "users",
                        "organisationUnitGroups.organisationUnitGroupSets",
                        "organisationUnitGroups.organisationUnitGroupSets.attributes",
                    ],
                },
                indicators: {
                    includeRules: ["attributes", "legendSets"],
                    excludeRules: ["dataSets", "programs"],
                },
            };

            expect(editedSyncRule.metadataExcludeIncludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
        it("should remove the rule and children from include and to add it to exclude if select only one but with a children to move", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules(false);

            const editedSyncRule = syncRule.moveRuleFromIncludeToExclude("organisationUnit", [1]);

            const expectedMetadataIncludeExcludeRules = {
                organisationUnit: {
                    includeRules: ["attributes"],
                    excludeRules: [
                        "legendSets",
                        "dataSets",
                        "programs",
                        "users",
                        "organisationUnitGroups",
                        "organisationUnitGroups.attributes",
                        "organisationUnitGroups.organisationUnitGroupSets",
                        "organisationUnitGroups.organisationUnitGroupSets.attributes",
                    ],
                },
                indicators: {
                    includeRules: ["attributes", "legendSets"],
                    excludeRules: ["dataSets", "programs"],
                },
            };

            expect(editedSyncRule.metadataExcludeIncludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
        it("should remove the rules from include and to add the rules to exclude if select more of one to move", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules();

            const editedSyncRule = syncRule.moveRuleFromIncludeToExclude("organisationUnit", [
                0,
                1,
            ]);

            const expectedMetadataIncludeExcludeRules = {
                organisationUnit: {
                    includeRules: ["programs", "users"],
                    excludeRules: [
                        "attributes",
                        "organisationUnitGroups",
                        "organisationUnitGroups.attributes",
                        "organisationUnitGroups.organisationUnitGroupSets",
                        "organisationUnitGroups.organisationUnitGroupSets.attributes",
                        "legendSets",
                        "dataSets",
                    ],
                },
                indicators: {
                    includeRules: ["attributes", "legendSets"],
                    excludeRules: ["dataSets", "programs"],
                },
            };

            expect(editedSyncRule.metadataExcludeIncludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
        it("should remove the rule and children from include and to add it to exclude without duplicates if select parents and children to move", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules(false);

            const editedSyncRule = syncRule.moveRuleFromIncludeToExclude("organisationUnit", [
                1,
                2,
                3,
                4,
            ]);

            const expectedMetadataIncludeExcludeRules = {
                organisationUnit: {
                    includeRules: ["attributes"],
                    excludeRules: [
                        "legendSets",
                        "dataSets",
                        "programs",
                        "users",
                        "organisationUnitGroups",
                        "organisationUnitGroups.attributes",
                        "organisationUnitGroups.organisationUnitGroupSets",
                        "organisationUnitGroups.organisationUnitGroupSets.attributes",
                    ],
                },
                indicators: {
                    includeRules: ["attributes", "legendSets"],
                    excludeRules: ["dataSets", "programs"],
                },
            };

            expect(editedSyncRule.metadataExcludeIncludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
    });
});

function givenASyncRuleWithMetadataIncludeExcludeRules(dependantRulesInExclude = true) {
    if (dependantRulesInExclude) {
        return createASyncRuleWithMetadataIncludeExcludeRules({
            organisationUnit: {
                includeRules: ["legendSets", "dataSets", "programs", "users"],
                excludeRules: [
                    "attributes",
                    "organisationUnitGroups",
                    "organisationUnitGroups.attributes",
                    "organisationUnitGroups.organisationUnitGroupSets",
                    "organisationUnitGroups.organisationUnitGroupSets.attributes",
                ],
            },
            indicators: {
                includeRules: ["attributes", "legendSets"],
                excludeRules: ["dataSets", "programs"],
            },
        });
    } else {
        return createASyncRuleWithMetadataIncludeExcludeRules({
            organisationUnit: {
                includeRules: [
                    "attributes",
                    "organisationUnitGroups",
                    "organisationUnitGroups.attributes",
                    "organisationUnitGroups.organisationUnitGroupSets",
                    "organisationUnitGroups.organisationUnitGroupSets.attributes",
                ],
                excludeRules: ["legendSets", "dataSets", "programs", "users"],
            },
            indicators: {
                includeRules: ["attributes", "legendSets"],
                excludeRules: ["dataSets", "programs"],
            },
        });
    }
}

function createASyncRuleWithMetadataIncludeExcludeRules(metadataIncludeExcludeRules) {
    return new SyncRule({
        id: "",
        name: "",
        description: "",
        builder: {
            metadataIncludeExcludeRules: metadataIncludeExcludeRules,
            useDefaultIncludeExclude: false,
            targetInstances: [],
            metadataIds: ["id1", "id2"],
        },
        enabled: false,
    });
}

function givenASyncRuleWithoutMetadataIncludeExcludeRules() {
    return new SyncRule({
        id: "",
        name: "",
        description: "",
        builder: {
            metadataIncludeExcludeRules: {},
            useDefaultIncludeExclude: true,
            targetInstances: [],
            metadataIds: ["id1", "id2"],
        },
        enabled: false,
    });
}

export {};
