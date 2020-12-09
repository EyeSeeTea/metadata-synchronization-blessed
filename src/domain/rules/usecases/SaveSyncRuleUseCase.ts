import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationRule } from "../entities/SynchronizationRule";

export class SaveSyncRuleUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(report: SynchronizationRule): Promise<void> {
        const user = await this.repositoryFactory.instanceRepository(this.localInstance).getUser();
        const persistedReport = report.update({ lastUpdated: new Date(), lastUpdatedBy: user });

        await this.repositoryFactory.rulesRepository(this.localInstance).save(persistedReport);
    }
}
