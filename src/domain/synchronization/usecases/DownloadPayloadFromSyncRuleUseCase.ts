import _ from "lodash";
import moment from "moment";
import i18n from "../../../locales";
import { CompositionRoot } from "../../../presentation/CompositionRoot";
import { promiseMap } from "../../../utils/common";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationRule } from "../../rules/entities/SynchronizationRule";
import { DownloadItem } from "../../storage/repositories/DownloadRepository";
import { SynchronizationPayload } from "../entities/SynchronizationPayload";
import { GenericSyncUseCase } from "./GenericSyncUseCase";

type DownloadErrors = string[];

export class DownloadPayloadFromSyncRuleUseCase implements UseCase {
    constructor(
        private compositionRoot: CompositionRoot,
        private repositoryFactory: RepositoryFactory,
        private localInstance: Instance
    ) {}

    async execute(syncRuleId: string): Promise<Either<DownloadErrors, true>> {
        const rule = await this.getSyncRule(syncRuleId);
        if (!rule) return Either.success(true);

        const sync: GenericSyncUseCase = this.compositionRoot.sync[rule.type](rule.toBuilder());
        const payload: SynchronizationPayload = await sync.buildPayload();
        const date = moment().format("YYYYMMDDHHmm");

        const mappedData = await promiseMap(rule.targetInstances, async id => {
            const instanceRepository = this.repositoryFactory.instanceRepository(
                this.localInstance
            );
            const instance = await instanceRepository.getById(id);

            if (instance) {
                try {
                    const mappedPayload = await sync.mapPayload(instance, payload);

                    return {
                        name: _(["synchronization", rule.name, rule.type, instance.name, date])
                            .compact()
                            .kebabCase(),
                        content: mappedPayload,
                    };
                } catch (error) {
                    return i18n.t(`An error has ocurred mapping payload for instance {{name}}`, {
                        name: instance.name,
                    });
                }
            } else {
                return i18n.t(`Instance {{id}} not found`, { id });
            }
        });

        const files = mappedData.filter(data => !(typeof data === "string")) as DownloadItem[];
        const errors = mappedData.filter(data => typeof data === "string") as string[];

        if (files.length === 1) {
            this.repositoryFactory
                .downloadRepository()
                .downloadFile(files[0].name, files[0].content);
        } else if (files.length > 1) {
            await this.repositoryFactory
                .downloadRepository()
                .downloadZippedFiles(`synchronization-${date}`, files);
        }

        if (errors.length === 0) {
            return Either.success(true);
        } else {
            return Either.error(errors);
        }
    }

    private async getSyncRule(id?: string): Promise<SynchronizationRule | undefined> {
        if (!id) return undefined;

        return this.repositoryFactory.rulesRepository(this.localInstance).getById(id);
    }
}
