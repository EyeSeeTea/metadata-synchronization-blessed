import _ from "lodash";
import moment from "moment";
import { promiseMap } from "../../../utils/common";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";

export class ExportSyncRuleUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(ids: string[]): Promise<void> {
        const rules = await promiseMap(ids, id =>
            this.repositoryFactory.rulesRepository(this.localInstance).getById(id)
        );

        const date = moment().format("YYYYMMDDHHmm");

        const exportRules = _.compact(rules).map(rule => {
            const ruleName = _.kebabCase(rule.name);
            return { name: `sync-rule-${ruleName}-${date}`, content: rule.toObject() };
        });

        if (exportRules.length === 1) {
            this.repositoryFactory.downloadRepository().downloadFile(exportRules[0].name, exportRules[0].content);
        } else {
            await this.repositoryFactory.downloadRepository().downloadZippedFiles(`sync-rules-${date}`, exportRules);
        }
    }
}
