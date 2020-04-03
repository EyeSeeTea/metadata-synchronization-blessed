import { D2Api, D2ModelSchemas, Model } from "d2-api";
import { ObjectsTableDetailField, TableColumn } from "d2-ui-components";
import _ from "lodash";
import { D2, ModelDefinition } from "../../types/d2";
import {
    d2BaseModelColumns,
    d2BaseModelDetails,
    d2BaseModelFields,
    MetadataType,
} from "../../utils/d2";

export abstract class D2Model {
    // Metadata Type should be defined on subclasses
    protected static metadataType: string;
    protected static collectionName: keyof D2ModelSchemas;
    protected static groupFilterName: keyof D2ModelSchemas;
    protected static levelFilterName: keyof D2ModelSchemas;
    protected static modelName: string | undefined;

    protected static excludeRules: string[] = [];
    protected static includeRules: string[] = [];

    // Other static properties can be optionally overridden on subclasses
    protected static columns = d2BaseModelColumns;
    protected static details = d2BaseModelDetails;
    protected static fields = d2BaseModelFields;
    protected static initialSorting = ["name", "asc"];
    protected static modelTransform: Function = (objects: object[]) => objects;
    protected static modelFilters: any = {};
    protected static childrenKeys: string[] | undefined = undefined;
    protected static mappingType: string | undefined;
    protected static isGlobalMapping = false;

    public static getD2Model(d2: D2): ModelDefinition {
        return d2.models[this.collectionName];
    }

    public static getApiModel(api: D2Api): InstanceType<typeof Model> {
        const modelCollection = api.models as {
            [ModelName in keyof D2ModelSchemas]: Model<ModelName>;
        };
        return modelCollection[this.collectionName];
    }

    public static getModelName(d2: D2): string {
        return this.modelName ?? this.getD2Model(d2)?.displayName ?? "Unknown model";
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

    public static getCollectionName(): keyof D2ModelSchemas {
        return this.collectionName;
    }

    public static getMappingType(): string | undefined {
        return this.mappingType;
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

    public static getGroupFilterName(): keyof D2ModelSchemas {
        return this.groupFilterName;
    }

    public static getLevelFilterName(): keyof D2ModelSchemas {
        return this.levelFilterName;
    }

    public static getChildrenKeys(): string[] | undefined {
        return this.childrenKeys;
    }
}

export function defaultModel(pascalCaseModelName: string): any {
    return class DefaultModel extends D2Model {
        protected static metadataType = pascalCaseModelName;
        protected static collectionName = pascalCaseModelName as keyof D2ModelSchemas;
    };
}
