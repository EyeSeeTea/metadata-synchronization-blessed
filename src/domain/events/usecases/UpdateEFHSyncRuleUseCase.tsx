import i18n from "../../../types/i18n";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataRepository } from "../../metadata/repositories/MetadataRepository";
import { SynchronizationRule } from "../../rules/entities/SynchronizationRule";
import { TEIRepository } from "../../tracked-entity-instances/repositories/TEIRepository";

export class UpdateEFHSyncRuleUseCase {
    formCode = "EFH_GENERAL_INTAKE_FORM";
    metadataRepository: MetadataRepository;
    teiRepository: TEIRepository;

    constructor(repositoryFactory: RepositoryFactory, instance: Instance) {
        this.metadataRepository = repositoryFactory.metadataRepository(instance);
        this.teiRepository = repositoryFactory.teisRepository(instance);
    }

    async execute(rule: SynchronizationRule): Promise<SynchronizationRule> {
        const program = await this.getEfhProgram();
        if (!program) throw new Error(i18n.t("EFH program not found"));

        const orgUnitPaths = program.organisationUnits.map(ou => ou.path);
        const teiIds: string[] = await this.getTeis(program, orgUnitPaths);

        return rule.updateDataSyncOrgUnitPaths(orgUnitPaths).updateDataSyncTEIs(teiIds);
    }

    private async getEfhProgram() {
        const res = await this.metadataRepository.listMetadata({
            type: "programs",
            fields: { id: true, organisationUnits: { path: true } },
            search: { field: "code", operator: "eq", value: this.formCode },
        });
        const form = res.objects[0] as unknown as Program | undefined;
        return form;
    }

    private async getTeis(form: Program, orgUnitPaths: string[]) {
        const teiIds: string[] = [];
        let page = 1;
        let done = false;

        while (!done) {
            const { trackedEntityInstances } = await this.teiRepository.getTEIs({ orgUnitPaths }, form.id, page, 1000);
            const teiIdsInPage = trackedEntityInstances.map(tei => tei.trackedEntityInstance);
            teiIds.push(...teiIdsInPage);

            page++;
            done = trackedEntityInstances.length === 0;
        }

        return teiIds;
    }
}

interface Program {
    id: string;
    organisationUnits: Array<{ path: string }>;
}
