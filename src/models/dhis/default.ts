import { FilterSingleOperatorBase } from "@eyeseetea/d2-api/api/common";
import { ObjectsTableDetailField, TableColumn } from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import { MetadataEntities } from "../../domain/metadata/entities/MetadataEntities";
import { D2Api, D2ApiDefinition, Model } from "../../types/d2-api";
import { d2BaseModelColumns, d2BaseModelDetails, d2BaseModelFields, MetadataType } from "../../utils/d2";

export interface SearchFilter {
    field: string;
    operator: FilterSingleOperatorBase;
}

// TODO: This concepts are our entity definition
// and should be in domain
export abstract class D2Model {
    // Metadata Type should be defined on subclasses
    protected static metadataType: string;
    protected static collectionName: keyof MetadataEntities;
    protected static groupFilterName: keyof MetadataEntities;
    protected static levelFilterName: keyof MetadataEntities;
    protected static modelName: string | undefined;

    protected static excludeRules: string[] = [];
    protected static includeRules: string[] = [];

    // Other static properties can be optionally overridden on subclasses
    protected static columns = d2BaseModelColumns;
    protected static details = d2BaseModelDetails;
    protected static fields = d2BaseModelFields;
    protected static searchFilter: SearchFilter = { field: "name", operator: "token" };
    protected static initialSorting = ["name", "asc"];
    protected static modelTransform: Function = (objects: object[]) => objects;
    protected static modelFilters: any = {};
    protected static childrenKeys: string[] | undefined = undefined;
    protected static mappingType: string | undefined;
    protected static parentMappingType: string | undefined;
    protected static isGlobalMapping = false;
    protected static isSelectable = true;

    public static getApiModel(api: D2Api): InstanceType<typeof Model> {
        const modelCollection = api.models as {
            [ModelKey in keyof D2ApiDefinition["schemas"]]: Model<
                D2ApiDefinition,
                D2ApiDefinition["schemas"][ModelKey]
            >;
        };
        return modelCollection[this.collectionName];
    }

    public static getModelName(): string {
        const api = new D2Api();
        const apiName = api.models[this.collectionName].schema.displayName;
        return this.modelName ?? apiName ?? "Unknown model";
    }

    public static getApiModelTransform(): (objects: MetadataType[]) => MetadataType[] {
        return objects =>
            this.modelTransform(objects).map(({ model, ...object }: MetadataType) => ({
                ...object,
                model: model ?? this,
            }));
    }

    // TODO: This should be typed (not priority)
    public static getApiModelFilters(): any {
        return this.modelFilters;
    }

    public static getMetadataType(): string {
        return this.metadataType;
    }

    public static getCollectionName(): keyof MetadataEntities {
        return this.collectionName;
    }

    public static getMappingType(): string | undefined {
        return this.mappingType;
    }

    public static getParentMappingType(): string | undefined {
        return this.parentMappingType;
    }

    public static getIsGlobalMapping(): boolean {
        return this.isGlobalMapping;
    }

    public static getExcludeRules(): string[][] {
        return this.excludeRules.map(_.toPath);
    }

    public static getIncludeRules(): string[][] {
        return this.includeRules.map(_.toPath);
    }

    public static getColumns(): TableColumn<MetadataType>[] {
        return this.columns;
    }

    public static getDetails(): ObjectsTableDetailField<MetadataType>[] {
        return this.details;
    }

    public static getFields(): { [key: string]: true } {
        return this.fields;
    }

    public static getInitialSorting(): string[] {
        return this.initialSorting;
    }

    public static getGroupFilterName(): keyof MetadataEntities {
        return this.groupFilterName;
    }

    public static getLevelFilterName(): keyof MetadataEntities {
        return this.levelFilterName;
    }

    public static getChildrenKeys(): string[] | undefined {
        return this.childrenKeys;
    }

    public static getSearchFilter(): SearchFilter {
        return this.searchFilter;
    }

    public static getIsSelectable(): boolean {
        return this.isSelectable;
    }
}

export function defaultModel(pascalCaseModelName: string): any {
    return class DefaultModel extends D2Model {
        protected static metadataType = pascalCaseModelName;
        protected static collectionName = pascalCaseModelName as keyof MetadataEntities;
    };
}
