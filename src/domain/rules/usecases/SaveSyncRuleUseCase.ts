import _ from "lodash";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationRule } from "../entities/SynchronizationRule";
import { MetadataEntity } from "../../metadata/entities/MetadataEntities";

export class SaveSyncRuleUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(rules: SynchronizationRule[]): Promise<void> {
        const updatedRules = await Promise.all(rules.map(rule => this.excludeSyncAllIds(rule)));

        await this.repositoryFactory.rulesRepository(this.localInstance).save(updatedRules);
    }

    private async excludeSyncAllIds(rule: SynchronizationRule): Promise<SynchronizationRule> {
        const instanceRepository = this.repositoryFactory.instanceRepository(this.localInstance);
        const instance = await instanceRepository.getById(rule.originInstance);
        if (!instance) throw Error("Instance not found");
        const metadataRepository = this.repositoryFactory.metadataRepository(instance);
        const metadata = await metadataRepository.getMetadataByIds<MetadataEntity>(rule.metadataIds, "id");
        const idsFromSyncAllMetadataTypes = _(metadata)
            .pick(rule.metadataModelsSyncAll)
            .values()
            .compact()
            .flatten()
            .map(entity => entity.id)
            .value();

        const remainingMetadataIds = _.difference(rule.metadataIds, idsFromSyncAllMetadataTypes);

        return rule.updateMetadataIds(remainingMetadataIds);
    }
}
