import i18n from "../../../utils/i18n";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { EmergencyType, getEmergencyResponseConfig } from "../../entities/EmergencyResponses";
import { Instance } from "../../instance/entities/Instance";
import { MetadataRepository } from "../../metadata/repositories/MetadataRepository";
import { SynchronizationRule } from "../../rules/entities/SynchronizationRule";
import { TEIRepository } from "../../tracked-entity-instances/repositories/TEIRepository";

export class UpdateEmergencyResponseSyncRuleUseCase {
    metadataRepository: MetadataRepository;
    teiRepository: TEIRepository;

    constructor(repositoryFactory: DynamicRepositoryFactory, instance: Instance) {
        this.metadataRepository = repositoryFactory.metadataRepository(instance);
        this.teiRepository = repositoryFactory.teisRepository(instance);
    }

    async execute(rule: SynchronizationRule, emergencyType: EmergencyType): Promise<SynchronizationRule> {
        const program = await this.getProgram(emergencyType);
        if (!program) throw new Error(i18n.t("Program not found"));

        const orgUnitPaths = program.organisationUnits.map(ou => ou.path);

        return rule.updateDataSyncOrgUnitPaths(orgUnitPaths);
    }

    private async getProgram(emergencyType: EmergencyType) {
        const programCode = getEmergencyResponseConfig(emergencyType).program;
        const res = await this.metadataRepository.listMetadata({
            type: "programs",
            fields: { id: true, organisationUnits: { path: true } },
            search: { field: "code", operator: "eq", value: programCode },
        });
        const form = res.objects[0] as unknown as Program | undefined;
        return form;
    }
}

interface Program {
    id: string;
    organisationUnits: Array<{ path: string }>;
}
