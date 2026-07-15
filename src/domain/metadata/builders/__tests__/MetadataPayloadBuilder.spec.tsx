import { anything, deepEqual, instance, mock, when } from "ts-mockito";
import { DynamicRepositoryFactory } from "../../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../../instance/entities/Instance";
import { MetadataRepository } from "../../repositories/MetadataRepository";
import { InstanceRepository } from "../../../instance/repositories/InstanceRepository";
import { SynchronizationPayload } from "../../../synchronization/entities/SynchronizationPayload";
import {
    getCategoryMetadata,
    getCategoryOptionsMetadata,
    getCategoryTypeExpectedPayload,
    getCategoryMetadataByIdsResponsesWithIncludeAll,
    givenABuilderWithCategoryType,
} from "./data/category-metadata-type";
import {
    getDataElementProgramMetadata,
    getProgramMetadata,
    getProgramMetadataByIdsResponsesWithIncludeAll,
    getProgramStageMetadata,
    getProgramTypeExpectedPayload,
    getTrackedEntityAttributeMetadata,
    getTrackedEntityTypeMetadata,
    givenABuilderWithProgramType,
} from "./data/program-metadata-type";
import {
    getDataElementDataSetMetadata,
    getDataElementGroupMetadata,
    getDataSetMetadata,
    getDataSetMetadataByIdsResponsesWithIncludeAll,
    getDataSetTypeExpectedPayload,
} from "./data/data-set-metadata-type";
import { MetadataPayloadBuilder } from "../MetadataPayloadBuilder";
import {
    givenABuilderWithUserGroupsAndDashboards,
    givenUserGroupsAndDashboardMetadataResponses,
} from "./data/user-groups-metadata.type";
import { MetadataPackage } from "../../entities/MetadataEntities";

// TODO: Notice these tests are fragile and can break easily if MetadataPayloadBuilder or the metadata structure changes.
// It is necesary a refactor of MetadataPayloadBuilder and the tests to make them more robust.
describe("MetadataPayloadBuilder", () => {
    describe("executing build method for a Category metadata type with default dependencies", () => {
        it("should return expected payload when option include objects and references of sharing settings, users and organisation units is selected", async () => {
            const includeObjectsAndReferencesOptions = {
                includeObjectsAndReferences: true,
                includeOnlyReferences: false,
            };

            const builder = givenABuilderWithCategoryType(includeObjectsAndReferencesOptions);

            const metadataPayloadBuilder = givenMetadataPayloadBuilderOfCategory(includeObjectsAndReferencesOptions);

            const payload: SynchronizationPayload = await metadataPayloadBuilder.build(builder);

            expect(payload.categories?.some(category => category.id === "cX5k9anHEHd")).toBe(true);
            expect((payload.categoryOptions ?? []).length).toBeGreaterThan(0);
            expect((payload.users ?? []).length).toBeGreaterThan(0);
            expect((payload.userRoles ?? []).length).toBeGreaterThan(0);
        });

        it("should return expected payload when option remove objects and references of sharing settings, users and organisation units is selected", async () => {
            const includeObjectsAndReferencesOptions = {
                includeObjectsAndReferences: false,
                includeOnlyReferences: false,
            };

            const builder = givenABuilderWithCategoryType(includeObjectsAndReferencesOptions);

            const metadataPayloadBuilder = givenMetadataPayloadBuilderOfCategory(includeObjectsAndReferencesOptions);

            const payload: SynchronizationPayload = await metadataPayloadBuilder.build(builder);

            const expectedPayload: SynchronizationPayload = getCategoryTypeExpectedPayload(
                includeObjectsAndReferencesOptions
            );

            expect(payload).toEqual(expectedPayload);
        });

        it("should return expected payload when option include only references of sharing settings, users and organisation units is selected", async () => {
            const includeObjectsAndReferencesOptions = {
                includeObjectsAndReferences: false,
                includeOnlyReferences: true,
            };

            const builder = givenABuilderWithCategoryType(includeObjectsAndReferencesOptions);

            const metadataPayloadBuilder = givenMetadataPayloadBuilderOfCategory(includeObjectsAndReferencesOptions);

            const payload: SynchronizationPayload = await metadataPayloadBuilder.build(builder);

            const expectedPayload: SynchronizationPayload = getCategoryTypeExpectedPayload(
                includeObjectsAndReferencesOptions
            );

            expect(payload).toEqual(expectedPayload);
        });

        function givenMetadataPayloadBuilderOfCategory(options: {
            includeObjectsAndReferences: boolean;
            includeOnlyReferences: boolean;
        }): MetadataPayloadBuilder {
            const { includeObjectsAndReferences } = options;

            const mockedInstanceRepository = mock<InstanceRepository>();
            when(mockedInstanceRepository.getById(anything())).thenResolve(dummyInstance);

            const mockedMetadataRepository = mock<MetadataRepository>();

            when(mockedMetadataRepository.getByFilterRules(anything())).thenResolve([]);

            when(mockedMetadataRepository.getMetadataByIds(anything(), anything())).thenResolve({
                categories: [
                    {
                        id: "cX5k9anHEHd",
                    },
                ],
            });

            if (includeObjectsAndReferences) {
                const metadataByIdsResponses = getCategoryMetadataByIdsResponsesWithIncludeAll();
                const resolver = buildMetadataByIdsResolver(Object.values(metadataByIdsResponses));
                when(mockedMetadataRepository.getMetadataByIds(anything())).thenCall((ids: string[]) => resolver(ids));
            } else {
                when(mockedMetadataRepository.getMetadataByIds(anything()))
                    .thenResolve({ categories: [getCategoryMetadata()] })
                    .thenResolve({ categoryOptions: getCategoryOptionsMetadata() });
            }

            when(mockedMetadataRepository.listAllMetadata(anything())).thenResolve([]);

            const mockedRepositoryFactory = mock<DynamicRepositoryFactory>();
            when(mockedRepositoryFactory.instanceRepository(anything())).thenReturn(instance(mockedInstanceRepository));
            when(mockedRepositoryFactory.metadataRepository(anything())).thenReturn(instance(mockedMetadataRepository));

            const metadataPayloadBuilder = new MetadataPayloadBuilder(instance(mockedRepositoryFactory), dummyInstance);

            return metadataPayloadBuilder;
        }
    });

    describe("executing build method for a Program metadata type with default dependencies", () => {
        it("should return expected payload when option include objects and references of sharing settings, users and organisation units is selected", async () => {
            const includeObjectsAndReferencesOptions = {
                includeObjectsAndReferences: true,
                includeOnlyReferences: false,
            };

            const builder = givenABuilderWithProgramType(includeObjectsAndReferencesOptions);

            const metadataPayloadBuilder = givenMetadataPayloadBuilderOfProgram(includeObjectsAndReferencesOptions);

            const payload: SynchronizationPayload = await metadataPayloadBuilder.build(builder);

            expect(payload.programs?.some(program => program.id === "beuHHwrDObK")).toBe(true);
            expect((payload.programStages ?? []).length).toBeGreaterThan(0);
            expect((payload.dataElements ?? []).length).toBeGreaterThan(0);
            expect((payload.trackedEntityTypes ?? []).length).toBeGreaterThan(0);
            expect((payload.users ?? []).length).toBeGreaterThan(0);
            expect((payload.userRoles ?? []).length).toBeGreaterThan(0);
        });

        it("should return expected payload when option remove objects and references of sharing settings, users and organisation units is selected", async () => {
            const includeObjectsAndReferencesOptions = {
                includeObjectsAndReferences: false,
                includeOnlyReferences: false,
            };

            const builder = givenABuilderWithProgramType(includeObjectsAndReferencesOptions);

            const metadataPayloadBuilder = givenMetadataPayloadBuilderOfProgram(includeObjectsAndReferencesOptions);

            const payload: SynchronizationPayload = await metadataPayloadBuilder.build(builder);

            const expectedPayload: SynchronizationPayload = getProgramTypeExpectedPayload(
                includeObjectsAndReferencesOptions
            );

            expect(payload).toEqual(expectedPayload);
        });

        it("should return expected payload when option include only references of sharing settings, users and organisation units is selected", async () => {
            const includeObjectsAndReferencesOptions = {
                includeObjectsAndReferences: false,
                includeOnlyReferences: true,
            };

            const builder = givenABuilderWithProgramType(includeObjectsAndReferencesOptions);

            const metadataPayloadBuilder = givenMetadataPayloadBuilderOfProgram(includeObjectsAndReferencesOptions);

            const payload: SynchronizationPayload = await metadataPayloadBuilder.build(builder);

            const expectedPayload: SynchronizationPayload = getProgramTypeExpectedPayload(
                includeObjectsAndReferencesOptions
            );

            expect(payload).toEqual(expectedPayload);
        });

        function givenMetadataPayloadBuilderOfProgram(options: {
            includeObjectsAndReferences: boolean;
            includeOnlyReferences: boolean;
        }): MetadataPayloadBuilder {
            const { includeObjectsAndReferences } = options;

            const mockedInstanceRepository = mock<InstanceRepository>();
            when(mockedInstanceRepository.getById(anything())).thenResolve(dummyInstance);

            const mockedMetadataRepository = mock<MetadataRepository>();

            when(mockedMetadataRepository.getByFilterRules(anything())).thenResolve([]);

            when(mockedMetadataRepository.getMetadataByIds(anything(), anything())).thenResolve({
                programs: [
                    {
                        id: "beuHHwrDObK",
                    },
                ],
            });

            if (includeObjectsAndReferences) {
                const metadataByIdsResponses = getProgramMetadataByIdsResponsesWithIncludeAll();
                const resolver = buildMetadataByIdsResolver(Object.values(metadataByIdsResponses));
                when(mockedMetadataRepository.getMetadataByIds(anything())).thenCall((ids: string[]) => resolver(ids));
            } else {
                when(mockedMetadataRepository.getMetadataByIds(anything()))
                    .thenResolve({ programs: [getProgramMetadata()] })
                    .thenResolve({ trackedEntityTypes: [getTrackedEntityTypeMetadata()] })
                    .thenResolve({ programStages: [getProgramStageMetadata()] })
                    .thenResolve({
                        dataElements: [getDataElementProgramMetadata()],
                        programStages: [getProgramStageMetadata()],
                    })
                    .thenResolve({ trackedEntityAttributes: [getTrackedEntityAttributeMetadata()] });
            }

            when(mockedMetadataRepository.listAllMetadata(anything())).thenResolve([]);

            const mockedRepositoryFactory = mock<DynamicRepositoryFactory>();
            when(mockedRepositoryFactory.instanceRepository(anything())).thenReturn(instance(mockedInstanceRepository));
            when(mockedRepositoryFactory.metadataRepository(anything())).thenReturn(instance(mockedMetadataRepository));

            const metadataPayloadBuilder = new MetadataPayloadBuilder(instance(mockedRepositoryFactory), dummyInstance);

            return metadataPayloadBuilder;
        }
    });

    describe("executing build method for a DataSet metadata type with default dependencies", () => {
        it("should return expected payload when option include objects and references of sharing settings, users and organisation units is selected", async () => {
            const includeObjectsAndReferencesOptions = {
                includeObjectsAndReferences: true,
                includeOnlyReferences: false,
            };

            const builder = givenABuilderWithProgramType(includeObjectsAndReferencesOptions);

            const metadataPayloadBuilder = givenMetadataPayloadBuilderOfDataSet(includeObjectsAndReferencesOptions);

            const payload: SynchronizationPayload = await metadataPayloadBuilder.build(builder);

            expect(payload.dataSets?.some(dataSet => dataSet.id === "rsyjyJmYD4J")).toBe(true);
            expect((payload.dataElements ?? []).length).toBeGreaterThan(0);
            expect((payload.dataElementGroups ?? []).length).toBeGreaterThan(0);
            expect((payload.users ?? []).length).toBeGreaterThan(0);
            expect((payload.userRoles ?? []).length).toBeGreaterThan(0);
        });

        it("should return expected payload when option remove objects and references of sharing settings, users and organisation units is selected", async () => {
            const includeObjectsAndReferencesOptions = {
                includeObjectsAndReferences: false,
                includeOnlyReferences: false,
            };

            const builder = givenABuilderWithProgramType(includeObjectsAndReferencesOptions);

            const metadataPayloadBuilder = givenMetadataPayloadBuilderOfDataSet(includeObjectsAndReferencesOptions);

            const payload: SynchronizationPayload = await metadataPayloadBuilder.build(builder);

            const expectedPayload: SynchronizationPayload = getDataSetTypeExpectedPayload(
                includeObjectsAndReferencesOptions
            );

            expect(payload).toEqual(expectedPayload);
        });

        it("should return expected payload when option include only references of sharing settings, users and organisation units is selected", async () => {
            const includeObjectsAndReferencesOptions = {
                includeObjectsAndReferences: false,
                includeOnlyReferences: true,
            };

            const builder = givenABuilderWithProgramType(includeObjectsAndReferencesOptions);

            const metadataPayloadBuilder = givenMetadataPayloadBuilderOfDataSet(includeObjectsAndReferencesOptions);

            const payload: SynchronizationPayload = await metadataPayloadBuilder.build(builder);

            const expectedPayload: SynchronizationPayload = getDataSetTypeExpectedPayload(
                includeObjectsAndReferencesOptions
            );

            expect(payload).toEqual(expectedPayload);
        });

        function givenMetadataPayloadBuilderOfDataSet(options: {
            includeObjectsAndReferences: boolean;
            includeOnlyReferences: boolean;
        }): MetadataPayloadBuilder {
            const { includeObjectsAndReferences } = options;

            const mockedInstanceRepository = mock<InstanceRepository>();
            when(mockedInstanceRepository.getById(anything())).thenResolve(dummyInstance);

            const mockedMetadataRepository = mock<MetadataRepository>();

            when(mockedMetadataRepository.getByFilterRules(anything())).thenResolve([]);

            when(mockedMetadataRepository.getMetadataByIds(anything(), anything())).thenResolve({
                dataSets: [
                    {
                        id: "rsyjyJmYD4J",
                    },
                ],
            });

            if (includeObjectsAndReferences) {
                const metadataByIdsResponses = getDataSetMetadataByIdsResponsesWithIncludeAll();
                const resolver = buildMetadataByIdsResolver(Object.values(metadataByIdsResponses));

                when(
                    mockedMetadataRepository.getMetadataByIds(anything(), anything(), anything(), anything())
                ).thenResolve(metadataByIdsResponses.first);
                when(mockedMetadataRepository.getMetadataByIds(anything())).thenCall((ids: string[]) => resolver(ids));
            } else {
                when(
                    mockedMetadataRepository.getMetadataByIds(anything(), anything(), anything(), anything())
                ).thenResolve({
                    dataSets: [getDataSetMetadata()],
                });
                when(mockedMetadataRepository.getMetadataByIds(anything()))
                    .thenResolve({
                        dataSets: [getDataSetMetadata()],
                        dataElements: [getDataElementDataSetMetadata()],
                    })
                    .thenResolve({
                        dataElementGroups: [getDataElementGroupMetadata()],
                    });
            }

            when(mockedMetadataRepository.listAllMetadata(anything())).thenResolve([]);

            const mockedRepositoryFactory = mock<DynamicRepositoryFactory>();
            when(mockedRepositoryFactory.instanceRepository(anything())).thenReturn(instance(mockedInstanceRepository));
            when(mockedRepositoryFactory.metadataRepository(anything())).thenReturn(instance(mockedMetadataRepository));

            const metadataPayloadBuilder = new MetadataPayloadBuilder(instance(mockedRepositoryFactory), dummyInstance);

            return metadataPayloadBuilder;
        }
    });

    const dummyInstance = Instance.build({
        id: "LOCAL",
        name: "This instance",
        type: "local",
        url: "http://localhost:8080",
    });

    describe("executing build method for a dashboard and a usergroup - dashboard referencing the usergroup", () => {
        it("should return expected payload when option include objects and references of sharing settings, users and organisation units is selected", async () => {
            // The builder includes metadataTypes = userGroups and dashboards, metadataIds = one dashboard and one usergroup.
            // The dashboard references the usergroup
            // The user group must include all its users as per the builder includeRules.

            const includeObjectsAndReferencesOptions = {
                includeObjectsAndReferences: true,
                includeOnlyReferences: false,
            };
            const builder = givenABuilderWithUserGroupsAndDashboards(includeObjectsAndReferencesOptions);

            const metadataPayloadBuilder = givenMetadataPayloadBuilderOfUserGroupsAndDashboards(
                includeObjectsAndReferencesOptions
            );

            const payload: SynchronizationPayload = await metadataPayloadBuilder.build(builder);

            expect(payload.users).toHaveLength(2);
            expect(payload.userGroups).toHaveLength(1);
            expect(payload.dashboards).toHaveLength(1);
            expect(payload.userRoles).toHaveLength(1);
        });

        function givenMetadataPayloadBuilderOfUserGroupsAndDashboards(options: {
            includeObjectsAndReferences: boolean;
            includeOnlyReferences: boolean;
        }): MetadataPayloadBuilder {
            const { includeObjectsAndReferences } = options;
            if (!includeObjectsAndReferences) {
                throw new Error("Not implemented");
            }
            const mockedInstanceRepository = mock<InstanceRepository>();
            when(mockedInstanceRepository.getById(anything())).thenResolve(dummyInstance);

            const mockedMetadataRepository = mock<MetadataRepository>();

            when(mockedMetadataRepository.getByFilterRules(anything())).thenResolve([]);

            const responses = givenUserGroupsAndDashboardMetadataResponses();

            when(mockedMetadataRepository.getMetadataByIds(anything(), anything())).thenResolve({
                dashboards: responses.dashboards.dashboards.map(d => ({ id: d.id })),
                userGroups: responses.userGroups.userGroups.map(ug => ({ id: ug.id })),
            });

            when(
                mockedMetadataRepository.getMetadataByIds(deepEqual([responses.userGroups.userGroups[0].id]))
            ).thenResolve(responses.userGroups);
            when(
                mockedMetadataRepository.getMetadataByIds(deepEqual([responses.dashboards.dashboards[0].id]))
            ).thenResolve(responses.dashboards);
            when(
                mockedMetadataRepository.getMetadataByIds(deepEqual(responses.users.users.map(u => u.id)))
            ).thenResolve(responses.users);
            when(mockedMetadataRepository.getMetadataByIds(deepEqual([responses.users.users[0].id]))).thenResolve({
                users: responses.users.users.filter(u => u.id === responses.users.users[0].id),
            });
            when(mockedMetadataRepository.getMetadataByIds(deepEqual([responses.users.users[1].id]))).thenResolve({
                users: responses.users.users.filter(u => u.id === responses.users.users[1].id),
            });
            when(
                mockedMetadataRepository.getMetadataByIds(deepEqual(responses.userRoles.userRoles.map(u => u.id)))
            ).thenResolve(responses.userRoles);

            when(mockedMetadataRepository.listAllMetadata(anything())).thenResolve([]);

            const mockedRepositoryFactory = mock<DynamicRepositoryFactory>();
            when(mockedRepositoryFactory.instanceRepository(anything())).thenReturn(instance(mockedInstanceRepository));
            when(mockedRepositoryFactory.metadataRepository(anything())).thenReturn(instance(mockedMetadataRepository));

            const metadataPayloadBuilder = new MetadataPayloadBuilder(instance(mockedRepositoryFactory), dummyInstance);

            return metadataPayloadBuilder;
        }
    });
});

function buildMetadataByIdsResolver(responses: MetadataPackage[]) {
    const indexByType = new Map<string, Map<string, unknown>>();

    responses.forEach(response => {
        Object.entries(response).forEach(([type, elements]) => {
            if (!Array.isArray(elements)) return;
            const typedIndex = indexByType.get(type) ?? new Map<string, unknown>();
            elements.forEach(element => {
                if (element && typeof element === "object" && "id" in element && typeof element.id === "string") {
                    typedIndex.set(element.id, element);
                }
            });
            indexByType.set(type, typedIndex);
        });
    });

    return (requestedIds: string[]) => {
        const requestSet = new Set(requestedIds);
        const resolved: MetadataPackage = {};

        indexByType.forEach((typedIndex, type) => {
            const matches = [...typedIndex.entries()]
                .filter(([id]) => requestSet.has(id))
                .map(([, element]) => element);

            if (matches.length > 0) {
                (resolved as Record<string, unknown[]>)[type] = matches;
            }
        });

        return resolved;
    };
}
