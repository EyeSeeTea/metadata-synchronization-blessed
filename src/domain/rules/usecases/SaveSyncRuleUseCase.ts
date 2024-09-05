import _ from "lodash";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationRule } from "../entities/SynchronizationRule";
import { MetadataEntity } from "../../metadata/entities/MetadataEntities";
import { promiseMap } from "../../../utils/common";

export class SaveSyncRuleUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(rules: SynchronizationRule[]): Promise<void> {
        const updatedRules = await this.updateWithLastSuccessfullSync(rules);

        await this.repositoryFactory.rulesRepository(this.localInstance).save(updatedRules);
    }

    private async updateWithLastSuccessfullSync(rules: SynchronizationRule[]): Promise<SynchronizationRule[]> {
        const history = await this.repositoryFactory.reportsRepository(this.localInstance).list();

        return await promiseMap(rules, async rule => {
            const cleanedRule = await this.excludeSyncAllIds(rule);
            const lastSuccessfulSync = _(history)
                .filter(report => report.syncRule === rule.id && report.status === "DONE")
                .maxBy(report => report.date)?.date;

            return lastSuccessfulSync ? cleanedRule.updateLastSuccessfulSync(lastSuccessfulSync) : cleanedRule;
        });
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
