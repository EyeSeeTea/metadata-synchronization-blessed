import i18n from "../../../locales";
import { promiseMap } from "../../../utils/common";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";

export class DeleteSyncRuleUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string): Promise<void> {
        const rule = await this.repositoryFactory.rulesRepository(this.localInstance).getById(id);
        if (!rule) return;

        await this.repositoryFactory.rulesRepository(this.localInstance).delete(id);

        const deletedRuleLabel = `${rule.name} (${i18n.t("deleted")})`;

        const syncReports = await this.repositoryFactory.reportsRepository(this.localInstance).list();

        const syncRuleReports = syncReports.filter(({ syncRule }) => syncRule === id);

        await promiseMap(syncRuleReports, async report => {
            report.setDeletedSyncRuleLabel(deletedRuleLabel);

            await this.repositoryFactory.reportsRepository(this.localInstance).save(report);
        });
    }
}
