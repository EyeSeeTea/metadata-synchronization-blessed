import _ from "lodash";
import moment from "moment";
import { promiseMap } from "../../../utils/common";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { DownloadRepository } from "../../storage/repositories/DownloadRepository";

export class ExportSyncRuleUseCase implements UseCase {
    constructor(
        private repositoryFactory: DynamicRepositoryFactory,
        private downloadRepository: DownloadRepository,
        private localInstance: Instance
    ) {}

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
            this.downloadRepository.downloadFile(exportRules[0].name, exportRules[0].content);
        } else {
            await this.downloadRepository.downloadZippedFiles(`sync-rules-${date}`, exportRules);
        }
    }
}
