import _ from "lodash";
import moment from "moment";
import { metadataTransformations } from "../../../data/transformations/PackageTransformations";
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
import { TEIsPackage } from "../../tracked-entity-instances/entities/TEIsPackage";
import { createTEIsPayloadMapper } from "../../tracked-entity-instances/mapper/TEIsPayloadMapperFactory";
import { SynchronizationPayload } from "../entities/SynchronizationPayload";
import { SynchronizationResultType } from "../entities/SynchronizationType";
import { PayloadMapper } from "../mapper/PayloadMapper";
import { GenericSyncUseCase } from "./GenericSyncUseCase";

type DownloadErrors = string[];

type SynRuleIdParam = {
    kind: "syncRuleId";
    id: string;
};

type SynRuleParam = {
    kind: "syncRule";
    syncRule: SynchronizationRule;
};

type DownloadPayloadParams = SynRuleIdParam | SynRuleParam;

export class DownloadPayloadFromSyncRuleUseCase implements UseCase {
    constructor(
        private compositionRoot: CompositionRoot,
        private repositoryFactory: RepositoryFactory,
        private localInstance: Instance
    ) {}

    async execute(params: DownloadPayloadParams): Promise<Either<DownloadErrors, true>> {
        const rule = await this.getSyncRule(params);
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
                      instance => Promise.resolve(new GenericPackageMapper(instance, sync)),
                      payload
                  );

        const errors = mappedData.filter(data => typeof data === "string") as string[];
        const files = _.compact(
            mappedData.map(item => {
                if (typeof item === "string") return undefined;
                const payload = this.repositoryFactory
                    .transformationRepository()
                    .mapPackageTo(item.apiVersion, item.content, metadataTransformations);

                return { name: item.name, content: payload };
            })
        );

        if (files.length === 1) {
            this.repositoryFactory.downloadRepository().downloadFile(files[0].name, files[0].content);
        } else if (files.length > 1) {
            await this.repositoryFactory.downloadRepository().downloadZippedFiles(`synchronization-${date}`, files);
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
        createMapper: (instance: Instance) => Promise<PayloadMapper>,
        payload: SynchronizationPayload
    ) {
        const date = moment().format("YYYYMMDDHHmm");

        return await promiseMap(rule.targetInstances, async id => {
            const instanceRepository = this.repositoryFactory.instanceRepository(this.localInstance);
            const instance = await instanceRepository.getById(id);

            if (instance) {
                try {
                    const mappedPayload = await (await createMapper(instance)).map(payload);

                    return {
                        name: _(["synchronization", rule.name, resultType, instance.name, date]).compact().kebabCase(),
                        content: mappedPayload,
                        apiVersion: instance.apiVersion,
                    };
                } catch (error: any) {
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
                      instance => Promise.resolve(new GenericPackageMapper(instance, sync)),
                      { events }
                  )
                : [];

        const { trackedEntityInstances } = payload as TEIsPackage;

        const downloadItemsByTEIS =
            trackedEntityInstances.length > 0
                ? await this.mapToDownloadItems(
                      rule,
                      "trackedEntityInstances",
                      async instance => {
                          const mapping = await sync.getMapping(instance);

                          return await createTEIsPayloadMapper(
                              await this.getMetadataRepository(instance),
                              trackedEntityInstances,
                              mapping
                          );
                      },
                      { trackedEntityInstances }
                  )
                : [];

        const { dataValues } = payload as AggregatedPackage;

        //TODO: we should create AggregatedMapper to don't use this use case here
        const aggregatedSync = new AggregatedSyncUseCase(rule.builder, this.repositoryFactory, this.localInstance);

        const downloadItemsByAggregated =
            dataValues && dataValues.length > 0
                ? await this.mapToDownloadItems(
                      rule,
                      "aggregated",
                      instance => Promise.resolve(new GenericPackageMapper(instance, aggregatedSync)),
                      { dataValues }
                  )
                : [];

        return [...downloadItemsByEvents, ...downloadItemsByTEIS, ...downloadItemsByAggregated];
    }

    private async getSyncRule(params: DownloadPayloadParams): Promise<SynchronizationRule | undefined> {
        switch (params.kind) {
            case "syncRuleId": {
                return this.repositoryFactory.rulesRepository(this.localInstance).getById(params.id);
            }
            case "syncRule": {
                return params.syncRule;
            }
        }
    }

    protected async getMetadataRepository(remoteInstance: Instance) {
        return this.repositoryFactory.metadataRepository(remoteInstance);
    }
}

//TODO: When we have a mapper for every Package type this class should be removed
// And not use use case to map
class GenericPackageMapper implements PayloadMapper {
    constructor(private instance: Instance, private sync: GenericSyncUseCase) {}

    map(payload: SynchronizationPayload): Promise<SynchronizationPayload> {
        return this.sync.mapPayload(this.instance, payload);
    }
}
