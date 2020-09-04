import { FilterValueBase } from "d2-api/api/common";
import _ from "lodash";
import moment from "moment";
import { Ref } from "../../domain/common/entities/Ref";
import { Instance } from "../../domain/instance/entities/Instance";
import {
    MetadataEntities,
    MetadataEntity,
    MetadataPackage,
} from "../../domain/metadata/entities/MetadataEntities";
import {
    ListMetadataParams,
    ListMetadataResponse,
    MetadataRepository,
} from "../../domain/metadata/repositories/MetadataRepository";
import { MetadataImportParams } from "../../domain/metadata/types";
import { getClassName } from "../../domain/metadata/utils";
import { SynchronizationResult } from "../../domain/synchronization/entities/SynchronizationResult";
import { cleanOrgUnitPaths } from "../../domain/synchronization/utils";
import { TransformationRepository } from "../../domain/transformations/repositories/TransformationRepository";
import { D2Api, D2Model, MetadataResponse, Model, Stats, Id } from "../../types/d2-api";
import { Dictionary, Maybe } from "../../types/utils";
import { cache } from "../../utils/cache";
import { promiseMap } from "../../utils/common";
import { debug } from "../../utils/debug";
import { paginate } from "../../utils/pagination";
import { metadataTransformations } from "../transformations/PackageTransformations";
import {
    FilterRule,
    DateFilter,
    StringMatch,
    FilterWhere,
} from "../../domain/metadata/entities/FilterRule";
import { modelFactory } from "../../models/dhis/factory";
import { buildPeriodFromParams } from "../../domain/aggregated/utils";

export class MetadataD2ApiRepository implements MetadataRepository {
    private api: D2Api;

    constructor(
        private instance: Instance,
        private transformationRepository: TransformationRepository
    ) {
        this.api = new D2Api({ baseUrl: instance.url, auth: instance.auth });
    }

    /**
     * Return raw specific fields of metadata dhis2 models according to ids filter
     * @param ids metadata ids to retrieve
     */
    public async getMetadataByIds<T>(ids: string[], fields: string): Promise<MetadataPackage<T>> {
        const { apiVersion } = this.instance;

        const d2Metadata = await this.getMetadata<D2Model>(ids, fields);

        const metadataPackage = this.transformationRepository.mapPackageFrom(
            apiVersion,
            d2Metadata,
            metadataTransformations
        );

        return metadataPackage as T;
    }

    @cache()
    public async listMetadata({
        type,
        fields = { $owner: true },
        page,
        pageSize,
        order,
        ...params
    }: ListMetadataParams): Promise<ListMetadataResponse> {
        const filter = this.buildListFilters(params);
        const { apiVersion } = this.instance;
        const options = { type, fields, filter, order, page, pageSize };
        const { objects, pager } = await this.getListPaginated(options);

        const metadataPackage = this.transformationRepository.mapPackageFrom(
            apiVersion,
            { [type]: objects },
            metadataTransformations
        );

        return { objects: metadataPackage[type as keyof MetadataEntities] ?? [], pager };
    }

    @cache()
    public async listAllMetadata({
        type,
        fields = { $owner: true },
        order,
        ...params
    }: ListMetadataParams): Promise<MetadataEntity[]> {
        const filter = this.buildListFilters(params);
        const { apiVersion } = this.instance;
        const objects = await this.getListAll({ type, fields, filter, order });

        const metadataPackage = this.transformationRepository.mapPackageFrom(
            apiVersion,
            { [type]: objects },
            metadataTransformations
        );

        return metadataPackage[type as keyof MetadataEntities] ?? [];
    }

    /*
        Problem: When using a filter `{ id: { in: [id1, id2, ...] } }`, the request URL may result
        in a HTTP 414 URI Too Long (typically, the limit is 8Kb).

        Solution: Perform N sequential request and concatenate (+ sort) the objects manually.
    */
    private async getListGeneric(options: GetListAllOptions): Promise<GetListGenericResponse> {
        const { type, fields, filter, order = defaultOrder } = options;
        const idFilter = getIdFilter(filter, maxIds);

        if (idFilter) {
            const objectsLists = await promiseMap(_.chunk(idFilter.inIds, maxIds), async ids => {
                const newFilter = { ...filter, id: { ...idFilter.value, in: ids } };
                const { objects } = await this.getApiModel(type)
                    .get({ paging: false, fields, filter: newFilter })
                    .getData();
                return objects;
            });

            const objects = _(objectsLists).flatten().orderBy([order.field], [order.order]).value();
            return { useSingleApiRequest: false, objects };
        } else {
            const apiOrder = `${order.field}:${order.order}`;
            return { useSingleApiRequest: true, order: apiOrder };
        }
    }

    private async getListAll(options: GetListAllOptions) {
        const { type, fields, filter, order = defaultOrder } = options;
        const list = await this.getListGeneric({ type, fields, filter, order });

        if (list.useSingleApiRequest) {
            const { objects } = await this.getApiModel(type)
                .get({ paging: false, fields, filter, order: list.order })
                .getData();
            return objects;
        } else {
            return list.objects;
        }
    }

    private async getListPaginated(options: GetListPaginatedOptions) {
        const { type, fields, filter, order = defaultOrder, page = 1, pageSize = 50 } = options;
        const list = await this.getListGeneric({ type, fields, filter, order });

        if (list.useSingleApiRequest) {
            return this.getApiModel(type)
                .get({ paging: true, fields, filter, page, pageSize, order: list.order })
                .getData();
        } else {
            return paginate(list.objects, { page, pageSize });
        }
    }

    private buildListFilters({
        lastUpdated,
        group,
        level,
        parents,
        showOnlySelected,
        selectedIds = [],
        filterRows,
        search,
    }: Partial<ListMetadataParams>) {
        const filter: Dictionary<FilterValueBase> = {};

        if (lastUpdated) filter["lastUpdated"] = { ge: moment(lastUpdated).format("YYYY-MM-DD") };
        if (group) filter[`${group.type}.id`] = { eq: group.value };
        if (level) filter["level"] = { eq: level };
        if (parents) filter["parent.id"] = { in: cleanOrgUnitPaths(parents) };
        if (showOnlySelected) filter["id"] = { in: selectedIds.concat(filter["id"]?.in ?? []) };
        if (filterRows) filter["id"] = { in: filterRows.concat(filter["id"]?.in ?? []) };
        if (search) filter[search.field] = { [search.operator]: search.value };

        return filter;
    }

    public async save(
        metadata: MetadataPackage,
        additionalParams: MetadataImportParams
    ): Promise<SynchronizationResult> {
        const { apiVersion } = this.instance;
        const versionedPayloadPackage = this.transformationRepository.mapPackageTo(
            apiVersion,
            metadata,
            metadataTransformations
        );

        debug("Versioned metadata package", versionedPayloadPackage);

        try {
            const response = await this.postMetadata(versionedPayloadPackage, additionalParams);
            return this.cleanMetadataImportResponse(response, "metadata");
        } catch (error) {
            return {
                status: "NETWORK ERROR",
                instance: this.instance.toPublicObject(),
                date: new Date(),
                type: "metadata",
            };
        }
    }

    public async remove(
        metadata: MetadataPackage<Ref>,
        additionalParams: MetadataImportParams
    ): Promise<SynchronizationResult> {
        const response = await this.postMetadata(metadata, {
            ...additionalParams,
            importStrategy: "DELETE",
        });

        return this.cleanMetadataImportResponse(response, "deleted");
    }

    public async getByFilterRules(filterRules: FilterRule[]): Promise<Id[]> {
        const listOfIds = await promiseMap(filterRules, async filterRule => {
            const myClass = modelFactory(this.api, filterRule.metadataType);
            const collectionName = myClass.getCollectionName();
            // Make one request per field and join results. It's the only way to make a
            // OR text search on arbitrary (non-identifiable fields).
            const stringMatchFields: Array<string | null> = filterRule.stringMatch
                ? ["name", "code", "description"]
                : [null];
            const responses$ = stringMatchFields.map(async stringMatchField => {
                const data = await this.api
                    .get<Record<string, Maybe<Ref[]>>>(`/${collectionName}`, {
                        paging: false,
                        fields: "id",
                        filter: this.getFiltersForFilterRule(filterRule, stringMatchField),
                    })
                    .getData();
                return (data[collectionName] || []).map(ref => ref.id);
            });
            return _.union(...(await Promise.all(responses$)));
        });

        return _.union(...listOfIds);
    }

    private getFiltersForFilterRule(filterRule: FilterRule, stringMatchField: Maybe<string>) {
        const { created, lastUpdated, stringMatch } = filterRule;

        return _.concat(
            stringMatchField ? this.getFiltersForStringMatch(stringMatchField, stringMatch) : [],
            this.getFiltersForDateFilter("created", created),
            this.getFiltersForDateFilter("lastUpdated", lastUpdated)
        );
    }

    private getFiltersForStringMatch(field: string, stringMatch: Maybe<StringMatch>): string[] {
        if (!stringMatch || !stringMatch.where || !stringMatch.value.trim()) return [];
        const { where, value } = stringMatch;
        const operatorByWhere: Record<FilterWhere, string> = {
            startsWith: "$ilike",
            contains: "ilike",
            endsWith: "ilike$",
        };
        const operator = operatorByWhere[where];

        return operator ? [`${field}:${operator}:${value}`] : [];
    }

    private getFiltersForDateFilter(field: string, dateFilter: DateFilter): string[] {
        const [startDate, endDate] = buildPeriodFromParams(dateFilter);
        const dayFormat = "YYYY-MM-DD";

        return [
            `${field}:ge:${startDate.startOf("day").format(dayFormat)}`,
            `${field}:lt:${endDate.startOf("day").add(1, "day").format(dayFormat)}`,
        ];
    }

    private cleanMetadataImportResponse(
        importResult: MetadataResponse,
        type: "metadata" | "deleted"
    ): SynchronizationResult {
        const { status, stats, typeReports = [] } = importResult;
        const typeStats = typeReports.flatMap(({ klass, stats }) => ({
            ...formatStats(stats),
            type: getClassName(klass),
        }));

        const messages = typeReports.flatMap(({ objectReports = [] }) =>
            objectReports.flatMap(({ uid: id, errorReports = [] }) =>
                _.take(errorReports, 1).map(({ mainKlass, errorProperty, message }) => ({
                    id,
                    type: getClassName(mainKlass),
                    property: errorProperty,
                    message: message,
                }))
            )
        );

        return {
            status: status === "OK" ? "SUCCESS" : status,
            stats: formatStats(stats),
            typeStats,
            instance: this.instance.toPublicObject(),
            errors: messages,
            date: new Date(),
            type,
        };
    }

    private async postMetadata(
        payload: Partial<Record<string, unknown[]>>,
        additionalParams?: MetadataImportParams
    ): Promise<MetadataResponse> {
        const response = await this.api
            .post<MetadataResponse>(
                "/metadata",
                {
                    importMode: "COMMIT",
                    identifier: "UID",
                    importReportMode: "FULL",
                    importStrategy: "CREATE_AND_UPDATE",
                    mergeMode: "MERGE",
                    atomicMode: "ALL",
                    ...additionalParams,
                },
                payload
            )
            .getData();

        return response;
    }

    private async getMetadata<T>(
        elements: string[],
        fields = ":all"
    ): Promise<Record<string, T[]>> {
        const promises = [];
        for (let i = 0; i < elements.length; i += 100) {
            const requestElements = elements.slice(i, i + 100).toString();
            promises.push(
                this.api
                    .get("/metadata", {
                        fields,
                        filter: "id:in:[" + requestElements + "]",
                        defaults: "EXCLUDE",
                    })
                    .getData()
            );
        }
        const response = await Promise.all(promises);
        const results = _.deepMerge({}, ...response);
        if (results.system) delete results.system;
        return results;
    }

    private getApiModel(type: keyof MetadataEntities): InstanceType<typeof Model> {
        return this.api.models[type];
    }
}

const formatStats = (stats: Stats) => ({
    ..._.omit(stats, ["created"]),
    imported: stats.created,
});

const maxIds = 300;

const defaultOrder = { field: "id", order: "asc" } as const;

interface GetListAllOptions {
    type: ListMetadataParams["type"];
    fields: object;
    filter: Dictionary<FilterValueBase>;
    order?: ListMetadataParams["order"];
}

interface GetListPaginatedOptions extends GetListAllOptions {
    page?: number;
    pageSize?: number;
}

type GetListGenericResponse =
    | { useSingleApiRequest: false; objects: unknown[] }
    | { useSingleApiRequest: true; order: string };

function getIdFilter(
    filter: Dictionary<FilterValueBase>,
    maxIds: number
): { inIds: string[]; value: object } | null {
    const inIds = filter?.id?.in;

    if (inIds && inIds.length > maxIds) {
        return { inIds, value: filter["id"] };
    } else {
        return null;
    }
}
