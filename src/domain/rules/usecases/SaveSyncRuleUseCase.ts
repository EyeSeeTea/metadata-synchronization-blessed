import _ from "lodash";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataIncludeExcludeRules } from "../../metadata/entities/MetadataExcludeIncludeRules";
import { SynchronizationRule } from "../entities/SynchronizationRule";
import { MetadataEntity, MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { getModelsByMetadataAndSyncAll } from "../getModels";

export class SaveSyncRuleUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(rules: SynchronizationRule[]): Promise<void> {
        const updatedRules = await Promise.all(rules.map(rule => this.fixSyncRule(rule)));

        await this.repositoryFactory.rulesRepository(this.localInstance).save(updatedRules);
    }

    private async fixSyncRule(rule: SynchronizationRule): Promise<SynchronizationRule> {
        const metadata = await this.getMetadata(rule);

        const ruleExcludingSyncAllIds = await this.excludeSyncAllIds(rule, metadata);

        const ruleExcludingNonExistedTypes = await this.excludeIncludeExcludeNonExistedTypes(
            ruleExcludingSyncAllIds,
            metadata
        );

        return ruleExcludingNonExistedTypes;
    }

    private async excludeSyncAllIds(
        rule: SynchronizationRule,
        metadata: MetadataPackage
    ): Promise<SynchronizationRule> {
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

    private async excludeIncludeExcludeNonExistedTypes(
        rule: SynchronizationRule,
        metadata: MetadataPackage
    ): Promise<SynchronizationRule> {
        const models = getModelsByMetadataAndSyncAll(metadata, rule.metadataModelsSyncAll);
        const metadataTypes = models.map(model => model.getMetadataType());

        const fixedMetadataIncludeExcludeRules: MetadataIncludeExcludeRules = Object.keys(
            rule.metadataIncludeExcludeRules
        ).reduce<MetadataIncludeExcludeRules>((acc, metadataType) => {
            if (metadataTypes.includes(metadataType)) {
                acc[metadataType] = rule.metadataIncludeExcludeRules[metadataType];
            }
            return acc;
        }, {});

        return rule.updateSyncParams({ metadataIncludeExcludeRules: fixedMetadataIncludeExcludeRules });
    }

    private async getMetadata(rule: SynchronizationRule) {
        const instanceRepository = this.repositoryFactory.instanceRepository(this.localInstance);
        const instance = await instanceRepository.getById(rule.originInstance);
        if (!instance) throw Error("Instance not found");
        const metadataRepository = this.repositoryFactory.metadataRepository(instance);
        const metadata = await metadataRepository.getMetadataByIds<MetadataEntity>(rule.metadataIds, "id");
        return metadata;
    }
}
