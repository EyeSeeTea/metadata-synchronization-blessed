import { FilterBase, FilterValueBase } from "@eyeseetea/d2-api/api/common";
import _ from "lodash";
import moment from "moment";
import { buildPeriodFromParams } from "../../domain/aggregated/utils";
import { IdentifiableRef, Ref } from "../../domain/common/entities/Ref";
import { DataSource, isDhisInstance } from "../../domain/instance/entities/DataSource";
import { Instance } from "../../domain/instance/entities/Instance";
import {
    DateFilter,
    FilterRule,
    FilterWhere,
    StringMatch,
    stringMatchHasValue,
} from "../../domain/metadata/entities/FilterRule";
import {
    CategoryOptionCombo,
    MetadataEntities,
    MetadataEntity,
    MetadataPackage,
} from "../../domain/metadata/entities/MetadataEntities";
import {
    ListMetadataParams,
    ListMetadataResponse,
    MetadataRepository,
} from "../../domain/metadata/repositories/MetadataRepository";
import { MetadataImportParams } from "../../domain/metadata/entities/MetadataSynchronizationParams";
import { getClassName } from "../../domain/metadata/utils";
import { SynchronizationResult } from "../../domain/reports/entities/SynchronizationResult";
import { cleanOrgUnitPaths } from "../../domain/synchronization/utils";
import { TransformationRepository } from "../../domain/transformations/repositories/TransformationRepository";
import { modelFactory } from "../../models/dhis/factory";
import { D2Api, D2Model, Id, MetadataResponse, Model, Stats } from "../../types/d2-api";
import { Dictionary, isNotEmpty, Maybe } from "../../types/utils";
import { cache } from "../../utils/cache";
import { promiseMap } from "../../utils/common";
import { getD2APiFromInstance } from "../../utils/d2-utils";
import { debug } from "../../utils/debug";
import { paginate } from "../../utils/pagination";
import { metadataTransformations } from "../transformations/PackageTransformations";

export class MetadataD2ApiRepository implements MetadataRepository {
    private api: D2Api;
    private instance: Instance;

    constructor(instance: DataSource, private transformationRepository: TransformationRepository) {
        if (!isDhisInstance(instance)) {
            throw new Error("Invalid instance type for MetadataD2ApiRepository");
        }

        this.api = getD2APiFromInstance(instance);
        this.instance = instance;
    }

    /**
     * Return raw specific fields of metadata dhis2 models according to ids filter
     * @param ids metadata ids to retrieve
     */
    public async getMetadataByIds<T>(
        ids: string[],
        fields?: object | string,
        includeDefaults = false
    ): Promise<MetadataPackage<T>> {
        const { apiVersion } = this.instance;

        const requestFields = typeof fields === "object" ? getFieldsAsString(fields) : fields;
        const d2Metadata = await this.getMetadata<D2Model>(ids, requestFields, includeDefaults);

        if (apiVersion >= 32 && d2Metadata["dashboards"] && fields === undefined) {
            //Fix dashboard bug from 2.32
            //It's necessary request again dashboards retrieving viualizations with type to transforms
            //type is necessary to transform from visualizations to chart and report table
            const fixedD2Metadata = await this.getMetadata<D2Model>(
                ids,
                ":all,dashboardItems[:all,visualization[id,type]]",
                includeDefaults
            );

            const metadataPackage = this.transformationRepository.mapPackageFrom(
                apiVersion,
                fixedD2Metadata,
                metadataTransformations
            );

            return metadataPackage as T;
        } else {
            const metadataPackage = this.transformationRepository.mapPackageFrom(
                apiVersion,
                d2Metadata,
                metadataTransformations
            );

            return metadataPackage as T;
        }
    }

    @cache()
    public async listMetadata(listParams: ListMetadataParams): Promise<ListMetadataResponse> {
        const { type, fields = { $owner: true }, page, pageSize, order, rootJunction, ...params } = listParams;

        const filter = this.buildListFilters(params);
        const { apiVersion } = this.instance;
        const options = { type, fields, filter, order, page, pageSize, rootJunction };
        const { objects: baseObjects, pager } = await this.getListPaginated(options);
        // Prepend parent objects (if option enabled) as virtual rows, keep pagination unmodified.
        const objects = _.concat(await this.getParentObjects(listParams), baseObjects);

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

    public async lookupSimilar(query: IdentifiableRef): Promise<MetadataPackage<IdentifiableRef>> {
        const response = await this.api
            .get<MetadataPackage<IdentifiableRef>>("/metadata", {
                fields: getFieldsAsString({
                    id: true,
                    code: true,
                    name: true,
                    path: true,
                    level: true,
                }),
                filter: getFilterAsString({
                    name: { token: query.name },
                    id: { eq: query.id },
                    code: { eq: query.code },
                }),
                rootJunction: "OR",
                paging: false,
            })
            .getData();

        return _.omit(response, ["system"]);
    }

    @cache()
    public async getDefaultIds(filter?: string): Promise<string[]> {
        const response = (await this.api
            .get("/metadata", {
                filter: "identifiable:eq:default",
                fields: "id",
            })
            .getData()) as {
            [key: string]: { id: string }[];
        };

        const metadata = _.pickBy(response, (_value, type) => !filter || type === filter);

        return _(metadata)
            .omit(["system"])
            .values()
            .flatten()
            .map(({ id }) => id)
            .value();
    }

    @cache()
    public async getCategoryOptionCombos(): Promise<
        Pick<CategoryOptionCombo, "id" | "name" | "categoryCombo" | "categoryOptions">[]
    > {
        const { objects } = await this.api.models.categoryOptionCombos
            .get({
                paging: false,
                fields: {
                    id: true,
                    name: true,
                    categoryCombo: true,
                    categoryOptions: true,
                },
            })
            .getData();

        return objects;
    }

    private async getParentObjects(params: ListMetadataParams): Promise<unknown[]> {
        if (params.includeParents && isNotEmpty(params.parents)) {
            const parentIds = params.parents.map(ou => _(ou).split("/").last() || "");
            const originalFilter = this.buildListFilters(params);
            const filterWithoutParentIds = _.omit(originalFilter, ["parent.id"]);
            const getParentsOptions = {
                type: params.type,
                fields: params.fields || { $owner: true },
                // The original filter must still be applied, but parent IDs must be added
                // to filter["id"] (implicit AND operation) and filter["parent.id"] must be removed.
                filter: {
                    ...filterWithoutParentIds,
                    id: _.compact([originalFilter.id, { in: parentIds }]),
                },
            };
            return this.getListAll(getParentsOptions);
        } else {
            return [];
        }
    }

    /*
        Problem: When using a filter `{ id: { in: [id1, id2, ...] } }`, the request URL may result
        in a HTTP 414 URI Too Long (typically, the limit is 8Kb).

        Solution: Perform N sequential request and concatenate (+ sort) the objects manually.
    */
    private async getListGeneric(options: GetListAllOptions): Promise<GetListGenericResponse> {
        const { type, fields, filter, order = defaultOrder, rootJunction } = options;
        const idFilter = getIdFilter(filter, maxIds);

        if (idFilter) {
            const objectsLists = await promiseMap(_.chunk(idFilter.inIds, maxIds), async ids => {
                const newFilter = { ...filter, id: { ...idFilter.value, in: ids } };
                const { objects } = await this.getApiModel(type)
                    .get({ paging: false, fields, filter: newFilter, rootJunction })
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

    private async getListAll({ type, fields, filter, order = defaultOrder, rootJunction }: GetListAllOptions) {
        const list = await this.getListGeneric({ type, fields, filter, order, rootJunction });

        if (list.useSingleApiRequest) {
            //@ts-ignore Type instantation is too deep
            const { objects } = await this.getApiModel(type)
                .get({ paging: false, fields, filter, order: list.order })
                .getData();
            return objects;
        } else {
            return list.objects;
        }
    }

    private async getListPaginated({
        type,
        fields,
        filter,
        order = defaultOrder,
        page = 1,
        pageSize = 50,
        rootJunction,
    }: GetListPaginatedOptions) {
        const list = await this.getListGeneric({ type, fields, filter, order, rootJunction });

        if (list.useSingleApiRequest) {
            return this.getApiModel(type)
                .get({
                    paging: true,
                    fields,
                    filter,
                    page,
                    pageSize,
                    order: list.order,
                    rootJunction,
                })
                .getData();
        } else {
            return paginate(list.objects, { page, pageSize });
        }
    }

    private buildListFilters({
        lastUpdated,
        group,
        level,
        program,
        optionSet,
        category,
        includeParents,
        parents,
        showOnlySelected,
        selectedIds = [],
        filterRows,
        search,
        disableFilterRows = false,
        programType,
        domainType,
        childrenPropInList,
    }: Partial<ListMetadataParams>) {
        const filter: Dictionary<FilterValueBase> = {};

        if (lastUpdated) filter["lastUpdated"] = { ge: moment(lastUpdated).format("YYYY-MM-DD") };
        if (group) filter[`${group.type}.id`] = { eq: group.value };
        if (level) filter["level"] = { eq: level };
        if (program) filter["program.id"] = { eq: program };
        if (childrenPropInList) filter[childrenPropInList.prop] = { in: childrenPropInList.values };

        if (programType) {
            filter["programType"] = { eq: programType };
        }

        if (domainType) {
            filter["domainType"] = { eq: domainType };
        }

        if (optionSet) filter["optionSet.id"] = { eq: optionSet };
        if (category) filter["categories.id"] = { eq: category };
        if (includeParents && isNotEmpty(parents)) {
            filter["parent.id"] = { in: cleanOrgUnitPaths(parents) };
        }
        if (showOnlySelected) filter["id"] = { in: selectedIds.concat(filter["id"]?.in ?? []) };
        if (!disableFilterRows && filterRows) {
            filter["id"] = { in: filterRows.concat(filter["id"]?.in ?? []) };
        }
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

            if (!response) {
                return {
                    status: "ERROR",
                    instance: this.instance.toPublicObject(),
                    date: new Date(),
                    type: "metadata",
                };
            }

            return this.cleanMetadataImportResponse(response, "metadata");
        } catch (error: any) {
            if (error?.response?.data) {
                try {
                    return this.cleanMetadataImportResponse(error.response.data, "metadata");
                } catch (error: any) {
                    return {
                        status: "NETWORK ERROR",
                        instance: this.instance.toPublicObject(),
                        date: new Date(),
                        type: "metadata",
                    };
                }
            }

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
        try {
            const response = await this.postMetadata(metadata, {
                ...additionalParams,
                importStrategy: "DELETE",
            });

            if (!response) {
                return {
                    status: "ERROR",
                    instance: this.instance.toPublicObject(),
                    date: new Date(),
                    type: "deleted",
                };
            }

            return this.cleanMetadataImportResponse(response, "deleted");
        } catch (error: any) {
            if (error?.response?.data) {
                return this.cleanMetadataImportResponse(error.response.data, "deleted");
            }

            return {
                status: "NETWORK ERROR",
                instance: this.instance.toPublicObject(),
                date: new Date(),
                type: "deleted",
            };
        }
    }

    public async getByFilterRules(filterRules: FilterRule[]): Promise<Id[]> {
        const listOfIds = await promiseMap(filterRules, async filterRule => {
            const myClass = modelFactory(filterRule.metadataType);
            const collectionName = myClass.getCollectionName();
            // Make one separate request per field and join results. That the only way to
            // perform an OR text-search on arbitrary fields (identifiable: id, name, code).
            const stringMatchFields: (string | null)[] = stringMatchHasValue(filterRule.stringMatch)
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
        const { startDate, endDate } = buildPeriodFromParams(dateFilter);
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
        params: MetadataImportParams = {}
    ): Promise<MetadataResponse | null> {
        const { response } = await this.api.metadata
            .postAsync(payload, {
                atomicMode: params.atomicMode ?? "ALL",
                identifier: params.identifier ?? "UID",
                importMode: params.importMode ?? "COMMIT",
                importStrategy: params.importStrategy ?? "CREATE_AND_UPDATE",
                importReportMode: params.importReportMode ?? "FULL",
                mergeMode: params.mergeMode ?? "MERGE",
                flushMode: params.flushMode,
                preheatMode: params.preheatMode,
                skipSharing: params.skipSharing,
                skipValidation: params.skipValidation,
                userOverrideMode: params.userOverrideMode,
            })
            .getData();

        const result = await this.api.system.waitFor(response.jobType, response.id).getData();
        return result;
    }

    private async getMetadata<T>(
        elements: string[],
        fields = ":all",
        includeDefaults: boolean
    ): Promise<Record<string, T[]>> {
        const promises = [];
        const chunkSize = 50;

        for (let i = 0; i < elements.length; i += chunkSize) {
            const requestElements = elements.slice(i, i + chunkSize).toString();
            promises.push(
                this.api
                    .get("/metadata", {
                        fields,
                        filter: "id:in:[" + requestElements + "]",
                        defaults: includeDefaults ? undefined : "EXCLUDE",
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
    filter: Dictionary<FilterValueBase | FilterValueBase[]>;
    order?: ListMetadataParams["order"];
    rootJunction?: "AND" | "OR";
}

interface GetListPaginatedOptions extends GetListAllOptions {
    page?: number;
    pageSize?: number;
}

type GetListGenericResponse =
    | { useSingleApiRequest: false; objects: unknown[] }
    | { useSingleApiRequest: true; order: string };

function getIdFilter(filter: GetListAllOptions["filter"], maxIds: number): { inIds: string[]; value: object } | null {
    const filterIdOrList = filter?.id;
    if (!filterIdOrList) return null;

    const inIds = Array.isArray(filterIdOrList) ? filterIdOrList[0]?.in : filterIdOrList.in;

    if (inIds && inIds.length > maxIds) {
        return { inIds, value: filter["id"] };
    } else {
        return null;
    }
}

function applyFieldTransformers(key: string, value: any) {
    // eslint-disable-next-line
    if (value.hasOwnProperty("$fn")) {
        switch (value["$fn"]["name"]) {
            case "rename":
                return {
                    key: `${key}~rename(${value["$fn"]["to"]})`,
                    value: _.omit(value, ["$fn"]),
                };
            default:
                return { key, value };
        }
    } else {
        return { key, value };
    }
}

function getFieldsAsString(modelFields: object): string {
    return _(modelFields)
        .map((value0, key0: string) => {
            const { key, value } = applyFieldTransformers(key0, value0);

            if (typeof value === "boolean" || _.isEqual(value, {})) {
                return value ? key.replace(/^\$/, ":") : null;
            } else {
                return key + "[" + getFieldsAsString(value) + "]";
            }
        })
        .compact()
        .sortBy()
        .join(",");
}

function toArray<T>(itemOrItems: T | T[]): T[] {
    return Array.isArray(itemOrItems) ? itemOrItems : [itemOrItems];
}

function isEmptyFilterValue(val: any): boolean {
    return val === undefined || val === null || val === "";
}

function getFilterAsString(filter: FilterBase): string[] {
    return _.sortBy(
        _.flatMap(filter, (filterOrFilters, field) =>
            _.flatMap(toArray(filterOrFilters || []), filter =>
                _.compact(
                    _.map(filter, (value, op) =>
                        isEmptyFilterValue(value)
                            ? null
                            : op === "in" || op === "!in"
                            ? `${field}:${op}:[${(value as string[]).join(",")}]`
                            : `${field}:${op}:${value}`
                    )
                )
            )
        )
    );
}
