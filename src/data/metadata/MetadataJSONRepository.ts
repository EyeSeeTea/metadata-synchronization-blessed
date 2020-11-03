import _ from "lodash";
import { IdentifiableRef } from "../../domain/common/entities/Ref";
import { DataSource } from "../../domain/instance/entities/DataSource";
import { JSONDataSource } from "../../domain/instance/entities/JSONDataSource";
import { FilterRule } from "../../domain/metadata/entities/FilterRule";
import {
    CategoryOptionCombo,
    MetadataEntity,
    MetadataPackage,
} from "../../domain/metadata/entities/MetadataEntities";
import {
    ListMetadataParams,
    ListMetadataResponse,
    MetadataRepository,
} from "../../domain/metadata/repositories/MetadataRepository";
import { MetadataImportParams } from "../../domain/metadata/types";
import { SynchronizationResult } from "../../domain/synchronization/entities/SynchronizationResult";
import { TransformationRepository } from "../../domain/transformations/repositories/TransformationRepository";
import { Dictionary } from "../../types/utils";

export class MetadataJSONRepository implements MetadataRepository {
    private instance: JSONDataSource;

    constructor(instance: DataSource, private transformationRepository: TransformationRepository) {
        if (instance.type !== "json") {
            throw new Error("Invalid instance type for MetadataJSONRepository");
        }

        this.instance = instance;
    }

    public async listMetadata({
        type,
        page = 1,
        pageSize = 25,
        paging = true,
        search,
        order,
        showOnlySelected,
        selectedIds,
        filterRows,
        fields,
    }: ListMetadataParams): Promise<ListMetadataResponse> {
        const baseObjects = this.instance.metadata[type] ?? [];

        const filteredObjects = _(baseObjects)
            .filter(item => {
                if (!search) return true;
                const value = String(item[search.field]).toLowerCase();
                const lookup = String(search.value).toLowerCase();
                switch (search.operator) {
                    case "eq":
                        return value === lookup;
                    case "!eq":
                        return value !== lookup;
                    case "token":
                        return tokenSearch(value, lookup);
                    default:
                        console.error("Search operator not implemented", { item, search });
                        return false;
                }
            })
            .filter(item => {
                const enableFilter = showOnlySelected || filterRows;
                if (!enableFilter) return true;

                return selectedIds?.includes(item.id) || filterRows?.includes(item.id);
            })
            .orderBy(
                [data => data[order?.field ?? "name"]?.toLowerCase() ?? ""],
                [order?.order ?? "asc"]
            )
            .map(item => filterFields(item, fields, this.instance.metadata))
            .value();

        if (!paging) {
            return {
                objects: filteredObjects as MetadataEntity[],
                pager: { page: 1, pageSize: filteredObjects.length, total: filteredObjects.length },
            };
        }

        const total = filteredObjects.length;
        const firstItem = (page - 1) * pageSize;
        const lastItem = firstItem + pageSize;
        const objects = _.slice(filteredObjects, firstItem, lastItem) as MetadataEntity[];

        return { objects, pager: { page, pageSize, total } };
    }

    public async listAllMetadata(params: ListMetadataParams): Promise<MetadataEntity[]> {
        const { objects } = await this.listMetadata({ ...params, paging: false });
        return objects;
    }

    public async lookupSimilar(query: IdentifiableRef): Promise<MetadataPackage<IdentifiableRef>> {
        return _.mapValues(this.instance.metadata, items => {
            const filtered = items?.find(item => {
                const sameId = item.id === query.id;
                const sameCode = item.code === query.code;
                const sameName = tokenSearch(item.name, query.name);
                const sameShortName = tokenSearch(item.shortName, query.shortName ?? "");

                return sameId || sameCode || sameName || sameShortName;
            });
            return filtered as IdentifiableRef[];
        });
    }

    public async getMetadataByIds<T>(
        ids: string[],
        fields?: object | string,
        includeDefaults = false
    ): Promise<MetadataPackage<T>> {
        return _.mapValues(this.instance.metadata, (items = []) => {
            return items
                .filter(item => ids.includes(item.id))
                .filter(item => includeDefaults || item.code !== "default")
                .map(item => filterFields(item, fields, this.instance.metadata)) as T[];
        });
    }

    public async getDefaultIds(filter?: string): Promise<string[]> {
        const response = await this.lookupSimilar({
            name: "default",
            code: "default",
            id: "default",
        });

        const metadata = _.pickBy(response, (_value, type) => !filter || type === filter);

        return _(metadata)
            .values()
            .flatMap(array => array?.map(({ id }) => id) ?? [])
            .value();
    }

    public async getCategoryOptionCombos(): Promise<
        Pick<CategoryOptionCombo, "id" | "name" | "categoryCombo" | "categoryOptions">[]
    > {
        const items = await this.listAllMetadata({
            type: "categoryOptionCombos",
            fields: { id: true, name: true, categoryCombo: true, categoryOptions: true },
        });

        return items as CategoryOptionCombo[];
    }

    public async getByFilterRules(_filterRules: FilterRule[]): Promise<string[]> {
        throw new Error("Method not implemented.");
    }

    public async save(
        _metadata: MetadataPackage,
        _additionalParams?: MetadataImportParams
    ): Promise<SynchronizationResult> {
        console.log(this.transformationRepository);
        throw new Error("Method not implemented.");
    }

    public async remove(
        _metadata: MetadataPackage,
        _additionalParams?: MetadataImportParams
    ): Promise<SynchronizationResult> {
        throw new Error("Method not implemented.");
    }
}

const tokenSearch = (source: string, lookup: string): boolean => {
    if (!source || !lookup) return false;

    return _.some(
        lookup
            .toLowerCase()
            .split(" ")
            .map(token => source.toLowerCase().includes(token))
    );
};

// TODO: This method is not properly typed
// TODO: We do not support $owner and $all
const filterFields = (
    item: any,
    fields?: any,
    metadata?: MetadataPackage<Dictionary<any>>
): any => {
    if (!fields || typeof fields === "string") {
        console.error("Filtering fields is not supported for strings");
        return item;
    } else if (typeof item !== "object") {
        return item;
    }

    const metadataElement =
        _(metadata)
            .values()
            .compact()
            .flatten()
            .find(({ id }) => id === item.id) ?? {};

    const element = { ...metadataElement, ...item };

    if (fields === true) return element;

    return _.transform(
        fields,
        (result, value, field) => {
            if (!!value && Array.isArray(element[field])) {
                result[field] = element[field].map((subitem: unknown) =>
                    filterFields(subitem, value, metadata)
                );
            } else if (!!value && !_.isNil(element[field])) {
                result[field] = filterFields(element[field], value, metadata);
            }
        },
        {} as Dictionary<unknown>
    );
};
