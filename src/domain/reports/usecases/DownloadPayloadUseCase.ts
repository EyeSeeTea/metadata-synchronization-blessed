import _ from "lodash";
import moment from "moment";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationRule } from "../../rules/entities/SynchronizationRule";
import { SynchronizationReport } from "../entities/SynchronizationReport";
import { SynchronizationResult } from "../entities/SynchronizationResult";

export class DownloadPayloadUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(report: SynchronizationReport): Promise<void> {
        const syncRule = await this.getSyncRule(report.syncRule);
        const results = report.getResults().filter(({ payload }) => !!payload);
        if (results.length === 0) return;

        const buildName = (result?: SynchronizationResult) =>
            _([
                "synchronization",
                syncRule?.name,
                result?.type,
                result?.instance.name,
                moment(report.date).format("YYYYMMDDHHmm"),
            ])
                .compact()
                .kebabCase();

        if (results.length === 1) {
            this.repositoryFactory
                .downloadRepository()
                .downloadFile(buildName(results[0]), results[0].payload);
            return;
        }

        const files = results.map(result => ({ name: buildName(result), content: result.payload }));
        await this.repositoryFactory.downloadRepository().downloadZippedFiles(buildName(), files);
    }

    private async getSyncRule(id?: string): Promise<SynchronizationRule | undefined> {
        if (!id) return undefined;

        return this.repositoryFactory.rulesRepository(this.localInstance).getById(id);
    }
}
