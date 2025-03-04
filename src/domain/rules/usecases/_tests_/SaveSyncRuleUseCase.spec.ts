import { mock, instance, when, verify, anything, deepEqual } from "ts-mockito";
import { SaveSyncRuleUseCase } from "../SaveSyncRuleUseCase";
import { SynchronizationRule } from "../../entities/SynchronizationRule";
import { Instance } from "../../../instance/entities/Instance";
import { RepositoryFactory } from "../../../common/factories/RepositoryFactory";
import { MetadataRepository } from "../../../metadata/repositories/MetadataRepository";
import { InstanceRepository } from "../../../instance/repositories/InstanceRepository";
import { RulesRepository } from "../../repositories/RulesRepository";
import { MetadataPackage } from "../../../metadata/entities/MetadataEntities";

describe("SaveSyncRuleUseCase", () => {
    let mockedRulesRepository: RulesRepository;

    beforeEach(() => {
        mockedRulesRepository = mock<RulesRepository>();
    });

    it("should save all include exclude rules if all are valid", async () => {
        const ruleToSave = SynchronizationRule.create()
            .updateMetadataIds(["option1", "dataElement1"])
            .updateSyncParams({
                metadataIncludeExcludeRules: {
                    option: {
                        excludeRules: [],
                        includeRules: ["optionSets"],
                        includeOnlyReferencesRules: [],
                        includeReferencesAndObjectsRules: ["optionSets"],
                    },
                    dataElement: {
                        excludeRules: [],
                        includeRules: ["optionSets"],
                        includeOnlyReferencesRules: [],
                        includeReferencesAndObjectsRules: ["optionSets"],
                    },
                },
            });

        const metadataInRule = {
            options: [{ id: "Option1" }],
            dataElements: [{ id: "DataElement1" }],
        };

        const saveUseCase = givenARuleAndMetadata(metadataInRule as MetadataPackage);

        await saveUseCase.execute([ruleToSave]);

        verify(mockedRulesRepository.save(deepEqual([ruleToSave]))).once();
    });

    it("should remove non existed include exclude types in metadata", async () => {
        const ruleToSave = SynchronizationRule.create()
            .updateMetadataIds(["option1"])
            .updateSyncParams({
                metadataIncludeExcludeRules: {
                    option: {
                        excludeRules: [],
                        includeRules: ["optionSets"],
                        includeOnlyReferencesRules: [],
                        includeReferencesAndObjectsRules: ["optionSets"],
                    },
                    dataElement: {
                        excludeRules: [],
                        includeRules: ["optionSets"],
                        includeOnlyReferencesRules: [],
                        includeReferencesAndObjectsRules: ["optionSets"],
                    },
                },
            });

        const metadataInRule = {
            options: [{ id: "Option1" }],
        };

        const saveUseCase = givenARuleAndMetadata(metadataInRule as MetadataPackage);

        await saveUseCase.execute([ruleToSave]);

        const expectedRule = ruleToSave.updateSyncParams({
            metadataIncludeExcludeRules: {
                option: {
                    excludeRules: [],
                    includeRules: ["optionSets"],
                    includeOnlyReferencesRules: [],
                    includeReferencesAndObjectsRules: ["optionSets"],
                },
            },
        });

        verify(mockedRulesRepository.save(deepEqual([expectedRule]))).once();
    });

    const dummyInstance = Instance.build({
        id: "dummyInstance",
        name: "Dummy Instance",
        type: "local",
        url: "http://localhost:8080",
    });

    function givenARuleAndMetadata(metadataInRule: MetadataPackage): SaveSyncRuleUseCase {
        const mockedInstanceRepository = mock<InstanceRepository>();
        when(mockedInstanceRepository.getById(anything())).thenReturn(Promise.resolve(dummyInstance));

        const mockedMetadataRepository = mock<MetadataRepository>();
        when(mockedMetadataRepository.getMetadataByIds(anything(), anything())).thenReturn(
            Promise.resolve(metadataInRule)
        );

        const mockedRepositoryFactory = mock<RepositoryFactory>();
        when(mockedRepositoryFactory.instanceRepository(anything())).thenReturn(instance(mockedInstanceRepository));
        when(mockedRepositoryFactory.metadataRepository(anything())).thenReturn(instance(mockedMetadataRepository));
        when(mockedRepositoryFactory.rulesRepository(anything())).thenReturn(instance(mockedRulesRepository));

        const saveUseCase = new SaveSyncRuleUseCase(instance(mockedRepositoryFactory), dummyInstance);

        return saveUseCase;
    }
});
