import { anything, instance, mock, when } from "ts-mockito";
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

            const expectedPayload: SynchronizationPayload = getCategoryTypeExpectedPayload(
                includeObjectsAndReferencesOptions
            );

            expect(payload).toEqual(expectedPayload);
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
            when(mockedInstanceRepository.getVersion()).thenResolve("");

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

                when(mockedMetadataRepository.getMetadataByIds(anything()))
                    .thenResolve(metadataByIdsResponses.first)
                    .thenResolve(metadataByIdsResponses.second)
                    .thenResolve(metadataByIdsResponses.third)
                    .thenResolve(metadataByIdsResponses.fourth)
                    .thenResolve(metadataByIdsResponses.fifth)
                    .thenResolve(metadataByIdsResponses.sixth)
                    .thenResolve(metadataByIdsResponses.seventh)
                    .thenResolve(metadataByIdsResponses.eighth)
                    .thenResolve(metadataByIdsResponses.ninth)
                    .thenResolve(metadataByIdsResponses.tenth)
                    .thenResolve(metadataByIdsResponses.eleventh);
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

            const expectedPayload: SynchronizationPayload = getProgramTypeExpectedPayload(
                includeObjectsAndReferencesOptions
            );

            expect(payload).toEqual(expectedPayload);
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
            when(mockedInstanceRepository.getVersion()).thenResolve("");

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

                when(mockedMetadataRepository.getMetadataByIds(anything()))
                    .thenResolve(metadataByIdsResponses.first)
                    .thenResolve(metadataByIdsResponses.second)
                    .thenResolve(metadataByIdsResponses.third)
                    .thenResolve(metadataByIdsResponses.fourth)
                    .thenResolve(metadataByIdsResponses.fifth)
                    .thenResolve(metadataByIdsResponses.sixth)
                    .thenResolve(metadataByIdsResponses.seventh)
                    .thenResolve(metadataByIdsResponses.eighth)
                    .thenResolve(metadataByIdsResponses.ninth)
                    .thenResolve(metadataByIdsResponses.tenth)
                    .thenResolve(metadataByIdsResponses.eleventh);
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

            const expectedPayload: SynchronizationPayload = getDataSetTypeExpectedPayload(
                includeObjectsAndReferencesOptions
            );

            expect(payload).toEqual(expectedPayload);
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
            when(mockedInstanceRepository.getVersion()).thenResolve("");

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

                when(mockedMetadataRepository.getMetadataByIds(anything()))
                    .thenResolve(metadataByIdsResponses.first)
                    .thenResolve(metadataByIdsResponses.second)
                    .thenResolve(metadataByIdsResponses.third)
                    .thenResolve(metadataByIdsResponses.fourth)
                    .thenResolve(metadataByIdsResponses.fifth)
                    .thenResolve(metadataByIdsResponses.sixth)
                    .thenResolve(metadataByIdsResponses.seventh)
                    .thenResolve(metadataByIdsResponses.eighth);
            } else {
                when(mockedMetadataRepository.getMetadataByIds(anything()))
                    .thenResolve({ dataSets: [getDataSetMetadata()] })
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
});
