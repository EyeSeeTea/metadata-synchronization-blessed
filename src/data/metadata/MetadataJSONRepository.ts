import _ from "lodash";
import { Instance } from "../../domain/instance/entities/Instance";
import { JSONDataSource } from "../../domain/instance/entities/JSONDataSource";
import { FilterRule } from "../../domain/metadata/entities/FilterRule";
import { MetadataEntity, MetadataPackage } from "../../domain/metadata/entities/MetadataEntities";
import {
    ListMetadataParams,
    ListMetadataResponse,
    MetadataRepository,
} from "../../domain/metadata/repositories/MetadataRepository";
import { MetadataImportParams } from "../../domain/metadata/types";
import { SynchronizationResult } from "../../domain/synchronization/entities/SynchronizationResult";
import { TransformationRepository } from "../../domain/transformations/repositories/TransformationRepository";

export class MetadataJSONRepository implements MetadataRepository {
    private instance: JSONDataSource;

    constructor(
        instance: Instance | JSONDataSource,
        private transformationRepository: TransformationRepository
    ) {
        if (instance.type !== "json") {
            throw new Error("Invalid instance type for MetadataJSONRepository");
        }

        this.instance = instance;
        console.log(this.transformationRepository);
    }

    public async listMetadata(listParams: ListMetadataParams): Promise<ListMetadataResponse> {
        const { type, page = 1, pageSize = 25, paging = true, search, order } = listParams;
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
                        return value.includes(lookup);
                    default:
                        console.error("TODO: Default case", { item, search });
                        return false;
                }
            })
            .orderBy(
                [data => data[order?.field ?? "name"]?.toLowerCase() ?? ""],
                [order?.order ?? "asc"]
            )
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

    public async getMetadataByIds<T>(
        _ids: string[],
        _fields?: string
    ): Promise<MetadataPackage<T>> {
        throw new Error("Method not implemented.");
    }

    public async getByFilterRules(_filterRules: FilterRule[]): Promise<string[]> {
        throw new Error("Method not implemented.");
    }

    public async listAllMetadata(_params: ListMetadataParams): Promise<MetadataEntity[]> {
        throw new Error("Method not implemented.");
    }

    public async save(
        _metadata: MetadataPackage,
        _additionalParams?: MetadataImportParams
    ): Promise<SynchronizationResult> {
        throw new Error("Method not implemented.");
    }

    public async remove(
        _metadata: MetadataPackage,
        _additionalParams?: MetadataImportParams
    ): Promise<SynchronizationResult> {
        throw new Error("Method not implemented.");
    }
}
