import _ from "lodash";
import moment from "moment";
import i18n from "../../../locales";
import { CompositionRoot } from "../../../presentation/CompositionRoot";
import { promiseMap } from "../../../utils/common";
import { AggregatedPackage } from "../../aggregated/entities/AggregatedPackage";
import { AggregatedSyncUseCase } from "../../aggregated/usecases/AggregatedSyncUseCase";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { EventsPackage } from "../../events/entities/EventsPackage";
import { Instance } from "../../instance/entities/Instance";
import { SynchronizationRule } from "../../rules/entities/SynchronizationRule";
import { DownloadItem } from "../../storage/repositories/DownloadRepository";
import { TEIsPackage } from "../../tracked-entity-instances/entities/TEIsPackage";
import { TEIPackageMapper } from "../../tracked-entity-instances/mapper/TEIsPackageMapper";
import { SynchronizationPayload } from "../entities/SynchronizationPayload";
import { SynchronizationResultType } from "../entities/SynchronizationType";
import { PackageMapper } from "../mapper/PackageMapper";
import { GenericSyncUseCase } from "./GenericSyncUseCase";

type DownloadErrors = string[];

export class DownloadPayloadFromSyncRuleUseCase implements UseCase {
    constructor(
        private compositionRoot: CompositionRoot,
        private repositoryFactory: RepositoryFactory,
        private localInstance: Instance,
        protected readonly encryptionKey: string
    ) {}

    async execute(syncRuleId: string): Promise<Either<DownloadErrors, true>> {
        const rule = await this.getSyncRule(syncRuleId);
        if (!rule) return Either.success(true);

        const sync: GenericSyncUseCase = this.compositionRoot.sync[rule.type](rule.toBuilder());
        const payload: SynchronizationPayload = await sync.buildPayload();

        const date = moment().format("YYYYMMDDHHmm");

        const mappedData =
            rule.type === "events"
                ? await this.mapEventsSyncRulePayloadToDownloadItems(rule, sync, payload)
                : await this.mapToDownloadItems(
                      rule,
                      rule.type,
                      instance => new GenericPackageMapper(instance, sync),
                      payload
                  );

        const files = mappedData.filter(data => !(typeof data === "string")) as DownloadItem[];
        const errors = mappedData.filter(data => typeof data === "string") as string[];

        if (files.length === 1) {
            this.repositoryFactory
                .downloadRepository()
                .downloadFile(files[0].name, files[0].content, files[0].apiVersion);
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

    private async mapToDownloadItems(
        rule: SynchronizationRule,
        resultType: SynchronizationResultType,
        createMapper: (instance: Instance) => PackageMapper,
        payload: SynchronizationPayload
    ) {
        const date = moment().format("YYYYMMDDHHmm");

        return await promiseMap(rule.targetInstances, async id => {
            const instanceRepository = this.repositoryFactory.instanceRepository(
                this.localInstance
            );
            const instance = await instanceRepository.getById(id);

            if (instance) {
                try {
                    const mappedPayload = await createMapper(instance).map(payload);

                    return {
                        name: _(["synchronization", rule.name, resultType, instance.name, date])
                            .compact()
                            .kebabCase(),
                        content: mappedPayload,
                        apiVersion: instance.apiVersion,
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
    }

    private async mapEventsSyncRulePayloadToDownloadItems(
        rule: SynchronizationRule,
        sync: GenericSyncUseCase,
        payload: SynchronizationPayload
    ) {
        const { events } = payload as EventsPackage;

        const downloadItemsByEvents =
            events.length > 0
                ? await this.mapToDownloadItems(
                      rule,
                      "events",
                      instance => new GenericPackageMapper(instance, sync),
                      { events }
                  )
                : [];

        const { trackedEntityInstances } = payload as TEIsPackage;

        const downloadItemsByTEIS =
            trackedEntityInstances.length > 0
                ? await this.mapToDownloadItems(
                      rule,
                      "trackedEntityInstances",
                      _instance => new TEIPackageMapper(),
                      { trackedEntityInstances }
                  )
                : [];

        const { dataValues } = payload as AggregatedPackage;

        //TODO: we should create AggregatedMapper to don't use this use case here
        const aggregatedSync = new AggregatedSyncUseCase(
            rule.builder,
            this.repositoryFactory,
            this.localInstance,
            this.encryptionKey
        );

        const downloadItemsByAggregated =
            dataValues && dataValues.length > 0
                ? await this.mapToDownloadItems(
                      rule,
                      "aggregated",
                      instance => new GenericPackageMapper(instance, aggregatedSync),
                      { dataValues }
                  )
                : [];

        return [...downloadItemsByEvents, ...downloadItemsByTEIS, ...downloadItemsByAggregated];
    }

    private async getSyncRule(id?: string): Promise<SynchronizationRule | undefined> {
        if (!id) return undefined;

        return this.repositoryFactory.rulesRepository(this.localInstance).getById(id);
    }
}

//TODO: When we have a mapper for every Package type this class should be removed
// And not use use case to map
class GenericPackageMapper implements PackageMapper {
    constructor(private instance: Instance, private sync: GenericSyncUseCase) {}

    map(payload: SynchronizationPayload): Promise<SynchronizationPayload> {
        return this.sync.mapPayload(this.instance, payload);
    }
}
