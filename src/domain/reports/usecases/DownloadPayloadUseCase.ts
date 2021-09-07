import _ from "lodash";
import moment from "moment";
import { metadataTransformations } from "../../../data/transformations/PackageTransformations";
import { cache } from "../../../utils/cache";
import { promiseMap } from "../../../utils/common";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationRule } from "../../rules/entities/SynchronizationRule";
import { SynchronizationReport } from "../entities/SynchronizationReport";

export class DownloadPayloadUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(reports: SynchronizationReport[]): Promise<void> {
        const date = moment().format("YYYYMMDDHHmm");
        const instanceRepository = this.repositoryFactory.instanceRepository(this.localInstance);

        const fetchPayload = async (report: SynchronizationReport) => {
            const syncRule = await this.getSyncRule(report.syncRule);
            const results = report.getResults().filter(({ payload }) => !!payload);

            return await promiseMap(results, async result => {
                const instance = await instanceRepository.getById(result.instance.id);

                const apiVersion = instance?.apiVersion;

                const payload = apiVersion
                    ? this.repositoryFactory
                          .transformationRepository()
                          .mapPackageTo(apiVersion, result.payload, metadataTransformations)
                    : result.payload;

                const downloadItem = {
                    name: _(["synchronization", syncRule?.name, result?.type, result?.instance.name, date])
                        .compact()
                        .kebabCase(),
                    content: payload,
                };

                return downloadItem;
            });
        };

        const files = _(await promiseMap(reports, fetchPayload))
            .compact()
            .flatten()
            .value();

        if (files.length === 1) {
            this.repositoryFactory.downloadRepository().downloadFile(files[0].name, files[0].content);
        } else {
            await this.repositoryFactory
                .downloadRepository()
                .downloadZippedFiles(`synchronization-${moment().format("YYYYMMDDHHmm")}`, files);
        }
    }

    @cache()
    private async getSyncRule(id?: string): Promise<SynchronizationRule | undefined> {
        if (!id) return undefined;

        return this.repositoryFactory.rulesRepository(this.localInstance).getById(id);
    }
}
