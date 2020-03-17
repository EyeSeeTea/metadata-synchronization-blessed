import SyncRule from "../syncRule";
import { DataElementModel, IndicatorModel, OrganisationUnitModel } from "../d2Model";

const indicatorIncludeExcludeRules = {
    includeRules: [
        "attributes",
        "legendSets",
        "indicatorTypes",
        "indicatorGroups",
        "indicatorGroups.attributes",
        "indicatorGroups.indicatorGroupSets",
    ],
    excludeRules: ["dataSets", "programs"],
};

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

        describe("events", () => {
            it("should return false when is created using create method", async () => {
                const isValid = await SyncRule.create("events").isValid();
                expect(isValid).toEqual(false);
            });
            it("should return false when is created using createOnDemand method", async () => {
                const isValid = await SyncRule.createOnDemand("events").isValid();
                expect(isValid).toEqual(false);
            });
            it("should return true when contains name, instances and organisationUnits", async () => {
                const syncRule = SyncRule.create("events")
                    .updateName("SyncRule test")
                    .updateMetadataIds(["dataElement"])
                    .updateDataSyncAllEvents(true)
                    .updateDataSyncOrgUnitPaths(["/JLA7wl59oN3/WeeW3tgF69f"])
                    .updateDataSyncStartDate(new Date())
                    .updateDataSyncEndDate(new Date())
                    .updateTargetInstances(["fP3MMoWv6qp"]);
                const isValid = await syncRule.isValid();
                expect(isValid).toEqual(true);
            });
            it("should return false when does not contains organisationUnits", async () => {
                const syncRule = SyncRule.create("events")
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
            expect(editedSyncRule.metadataIncludeExcludeRules).toEqual({});
        });
        it("should assign default exclude include rules in models if set to false", () => {
            const syncRule = givenASyncRuleWithoutMetadataIncludeExcludeRules();

            const editedSyncRule = syncRule.markToNotUseDefaultIncludeExclude([
                DataElementModel,
                IndicatorModel,
            ]);

            expect(editedSyncRule.useDefaultIncludeExclude).toEqual(false);
            expect(editedSyncRule.metadataIncludeExcludeRules).toEqual({
                indicator: {
                    includeRules: [
                        "attributes",
                        "legendSets",
                        "indicatorTypes",
                        "indicatorGroups",
                        "indicatorGroups.attributes",
                        "indicatorGroups.indicatorGroupSets",
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
                    excludeRules: [
                        "dataElementGroups.dataElements",
                        "dataElementGroups.dataElementGroupSets.dataElementGroups",
                    ],
                },
            });
        });
    });

    describe("change metadataId", () => {
        it("should reset to empty exclude include rules if really has changed", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules();

            const editedSyncRule = syncRule.updateMetadataIds(["newId1", "newId2"]);

            expect(editedSyncRule.useDefaultIncludeExclude).toEqual(true);
            expect(editedSyncRule.metadataIncludeExcludeRules).toEqual({});
        });
    });

    describe("moveRuleFromExcludeToInclude", () => {
        it("should add the rule to include and to remove it from exclude if select only one to move", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules(true);

            const editedSyncRule = syncRule.moveRuleFromExcludeToInclude(
                OrganisationUnitModel.getMetadataType(),
                ["attributes"]
            );

            const expectedMetadataIncludeExcludeRules = {
                organisationUnit: {
                    includeRules: ["legendSets", "dataSets", "programs", "users", "attributes"],
                    excludeRules: [
                        "organisationUnitGroups.attributes",
                        "organisationUnitGroups.organisationUnitGroupSets",
                        "organisationUnitGroups.organisationUnitGroupSets.attributes",
                        "organisationUnitGroups",
                    ],
                },
                indicator: indicatorIncludeExcludeRules,
            };

            expect(editedSyncRule.metadataIncludeExcludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
        it("should add the rule and parent to include and to remove it from exclude list if select only one but with parent to move", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules(true);

            const editedSyncRule = syncRule.moveRuleFromExcludeToInclude(
                OrganisationUnitModel.getMetadataType(),
                ["organisationUnitGroups.attributes"]
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
                        "organisationUnitGroups.organisationUnitGroupSets",
                        "organisationUnitGroups.organisationUnitGroupSets.attributes",
                        "attributes",
                    ],
                },
                indicator: indicatorIncludeExcludeRules,
            };

            expect(editedSyncRule.metadataIncludeExcludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
        it("should add the rule and parents to include and to remove it from exclude list if select only one but with parents to move", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules(true);

            const editedSyncRule = syncRule.moveRuleFromExcludeToInclude(
                OrganisationUnitModel.getMetadataType(),
                ["organisationUnitGroups.organisationUnitGroupSets.attributes"]
            );

            const expectedMetadataIncludeExcludeRules = {
                organisationUnit: {
                    includeRules: [
                        "legendSets",
                        "dataSets",
                        "programs",
                        "users",
                        "organisationUnitGroups.organisationUnitGroupSets",
                        "organisationUnitGroups",
                        "organisationUnitGroups.organisationUnitGroupSets.attributes",
                    ],
                    excludeRules: ["organisationUnitGroups.attributes", "attributes"],
                },
                indicator: indicatorIncludeExcludeRules,
            };

            expect(editedSyncRule.metadataIncludeExcludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
        it("should add the rules to include and to remove it from exclude if select more of one to move", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules(true);

            const editedSyncRule = syncRule.moveRuleFromExcludeToInclude(
                OrganisationUnitModel.getMetadataType(),
                ["attributes", "organisationUnitGroups"]
            );

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
                indicator: indicatorIncludeExcludeRules,
            };

            expect(editedSyncRule.metadataIncludeExcludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
        it("should add the rules from include and to remove it to exclude without duplicates if select parent and children to move", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules(true);

            const editedSyncRule = syncRule.moveRuleFromExcludeToInclude(
                OrganisationUnitModel.getMetadataType(),
                [
                    "organisationUnitGroups",
                    "organisationUnitGroups.organisationUnitGroupSets",
                    "organisationUnitGroups.organisationUnitGroupSets.attributes",
                ]
            );

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
                    excludeRules: ["organisationUnitGroups.attributes", "attributes"],
                },
                indicator: indicatorIncludeExcludeRules,
            };

            expect(editedSyncRule.metadataIncludeExcludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
        it("should add the rule from include and to remove it to exclude without duplicates if select children with parent to move and parent exists in include", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules(true);

            const editedSyncRule1 = syncRule.moveRuleFromExcludeToInclude(
                OrganisationUnitModel.getMetadataType(),
                ["organisationUnitGroups"]
            );
            const editedSyncRule2 = editedSyncRule1.moveRuleFromExcludeToInclude(
                OrganisationUnitModel.getMetadataType(),
                ["organisationUnitGroups.attributes"]
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
                        "organisationUnitGroups.organisationUnitGroupSets",
                        "organisationUnitGroups.organisationUnitGroupSets.attributes",
                        "attributes",
                    ],
                },
                indicator: indicatorIncludeExcludeRules,
            };

            expect(editedSyncRule2.metadataIncludeExcludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
    });

    describe("moveRuleFromIncludeToExclude", () => {
        it("should remove the rule from include and to add it to exclude if select only one to move", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules(true);

            const editedSyncRule = syncRule.moveRuleFromIncludeToExclude(
                OrganisationUnitModel.getMetadataType(),
                ["legendSets"]
            );

            const expectedMetadataIncludeExcludeRules = {
                organisationUnit: {
                    includeRules: ["dataSets", "programs", "users"],
                    excludeRules: [
                        "organisationUnitGroups.attributes",
                        "organisationUnitGroups.organisationUnitGroupSets",
                        "organisationUnitGroups.organisationUnitGroupSets.attributes",
                        "attributes",
                        "organisationUnitGroups",
                        "legendSets",
                    ],
                },
                indicator: indicatorIncludeExcludeRules,
            };

            expect(editedSyncRule.metadataIncludeExcludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
        it("should remove the rule and child from include and to add it to exclude if select only one but with a child to move", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules();

            const editedSyncRule = syncRule.moveRuleFromIncludeToExclude(
                OrganisationUnitModel.getMetadataType(),
                ["organisationUnitGroups.organisationUnitGroupSets"]
            );

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
                        "organisationUnitGroups.organisationUnitGroupSets.attributes",
                        "organisationUnitGroups.organisationUnitGroupSets",
                    ],
                },
                indicator: indicatorIncludeExcludeRules,
            };

            expect(editedSyncRule.metadataIncludeExcludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
        it("should remove the rule and children from include and to add it to exclude if select only one but with a children to move", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules();

            const editedSyncRule = syncRule.moveRuleFromIncludeToExclude(
                OrganisationUnitModel.getMetadataType(),
                ["organisationUnitGroups"]
            );

            const expectedMetadataIncludeExcludeRules = {
                organisationUnit: {
                    includeRules: ["attributes"],
                    excludeRules: [
                        "legendSets",
                        "dataSets",
                        "programs",
                        "users",
                        "organisationUnitGroups.attributes",
                        "organisationUnitGroups.organisationUnitGroupSets",
                        "organisationUnitGroups.organisationUnitGroupSets.attributes",
                        "organisationUnitGroups",
                    ],
                },
                indicator: indicatorIncludeExcludeRules,
            };

            expect(editedSyncRule.metadataIncludeExcludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
        it("should remove the rules from include and to add the rules to exclude if select more of one to move", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules(true);

            const editedSyncRule = syncRule.moveRuleFromIncludeToExclude(
                OrganisationUnitModel.getMetadataType(),
                ["legendSets", "dataSets"]
            );

            const expectedMetadataIncludeExcludeRules = {
                organisationUnit: {
                    includeRules: ["programs", "users"],
                    excludeRules: [
                        "organisationUnitGroups.attributes",
                        "organisationUnitGroups.organisationUnitGroupSets",
                        "organisationUnitGroups.organisationUnitGroupSets.attributes",
                        "attributes",
                        "organisationUnitGroups",
                        "legendSets",
                        "dataSets",
                    ],
                },
                indicator: indicatorIncludeExcludeRules,
            };

            expect(editedSyncRule.metadataIncludeExcludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
        it("should remove the rule and children from include and to add it to exclude without duplicates if select parents and children to move", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules();

            const editedSyncRule = syncRule.moveRuleFromIncludeToExclude(
                OrganisationUnitModel.getMetadataType(),
                [
                    "organisationUnitGroups",
                    "organisationUnitGroups.attributes",
                    "organisationUnitGroups.organisationUnitGroupSets",
                    "organisationUnitGroups.organisationUnitGroupSets.attributes",
                ]
            );

            const expectedMetadataIncludeExcludeRules = {
                organisationUnit: {
                    includeRules: ["attributes"],
                    excludeRules: [
                        "legendSets",
                        "dataSets",
                        "programs",
                        "users",
                        "organisationUnitGroups.attributes",
                        "organisationUnitGroups.organisationUnitGroupSets",
                        "organisationUnitGroups.organisationUnitGroupSets.attributes",
                        "organisationUnitGroups",
                    ],
                },
                indicator: indicatorIncludeExcludeRules,
            };

            expect(editedSyncRule.metadataIncludeExcludeRules).toEqual(
                expectedMetadataIncludeExcludeRules
            );
        });
        it("should throw error if try move to include non exists rule in exclude", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules();

            const errorFunction = (): void => {
                syncRule.moveRuleFromExcludeToInclude(OrganisationUnitModel.getMetadataType(), [
                    "non existed rule",
                ]);
            };

            expect(errorFunction).toThrow(Error);
        });
        it("should throw error if try move to exclude non exists rule in include", () => {
            const syncRule = givenASyncRuleWithMetadataIncludeExcludeRules();

            const errorFunction = (): void => {
                syncRule.moveRuleFromIncludeToExclude(OrganisationUnitModel.getMetadataType(), [
                    "non existed rule",
                ]);
            };

            expect(errorFunction).toThrow(Error);
        });
    });
});

function givenASyncRuleWithMetadataIncludeExcludeRules(dependantRulesInExclude = false): SyncRule {
    const initialSyncRule = SyncRule.create("metadata")
        .updateMetadataIds(["id1", "id2"])
        .markToNotUseDefaultIncludeExclude([OrganisationUnitModel, IndicatorModel]);

    if (dependantRulesInExclude) {
        const includeRules =
            initialSyncRule.metadataIncludeExcludeRules[OrganisationUnitModel.getMetadataType()]
                .includeRules;
        const excludeRules =
            initialSyncRule.metadataIncludeExcludeRules[OrganisationUnitModel.getMetadataType()]
                .excludeRules;

        const editedSyncRule = initialSyncRule.moveRuleFromIncludeToExclude(
            OrganisationUnitModel.getMetadataType(),
            includeRules
        );
        return editedSyncRule.moveRuleFromExcludeToInclude(
            OrganisationUnitModel.getMetadataType(),
            excludeRules
        );
    } else {
        return initialSyncRule;
    }
}

function givenASyncRuleWithoutMetadataIncludeExcludeRules(): SyncRule {
    return SyncRule.create("metadata").updateMetadataIds(["id1", "id2"]);
}

export {};
