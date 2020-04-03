import { D2Api, D2ModelSchemas, Model } from "d2-api";
import { ObjectsTableDetailField, TableColumn } from "d2-ui-components";
import { isValidUid } from "d2/uid";
import _ from "lodash";
import { D2, ModelDefinition } from "../types/d2";
import {
    OrganisationUnitTableFilters,
    TableFilters,
    TableList,
    TablePagination,
} from "../types/d2-ui-components";
import {
    cleanParams,
    d2BaseModelColumns,
    d2BaseModelDetails,
    d2BaseModelFields,
    dataElementGroupFields,
    dataElementGroupSetFields,
    dataSetFields,
    MetadataType,
    organisationUnitFields,
    organisationUnitsColumns,
    organisationUnitsDetails,
    programFields,
} from "../utils/d2";

export abstract class D2Model {
    // Metadata Type should be defined on subclasses
    protected static metadataType: string;
    protected static collectionName: keyof D2ModelSchemas;
    protected static mappingType: string;
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
    protected static modelTransform: Function = (objects: MetadataType[]) => objects;
    protected static modelFilters: any = {};
    protected static childrenKeys: string[] | undefined = undefined;

    // List method should be executed by a wrapper to preserve static context binding
    public static async listMethod(
        d2: D2,
        filters: TableFilters,
        pagination: TablePagination
    ): Promise<TableList> {
        const {
            search = null,
            fields: overriddenFields = null,
            lastUpdatedDate = null,
            groupFilter = null,
            customFilters = [],
            customFields = [],
        } = filters || {};
        const { page = 1, pageSize = 20, sorting = this.initialSorting, paging = true } =
            pagination || {};

        const details = this.details.map(e => e.name);
        const columns = this.columns.map(e => e.name);
        const fields = overriddenFields
            ? overriddenFields
            : _.union(details, columns, customFields);

        const [field, direction] = sorting;
        const order = `${field}:i${direction}`;
        const filter = _.compact([
            search && isValidUid(search) ? `id:eq:${search}` : null,
            search && !isValidUid(search) ? `displayName:ilike:${search}` : null,
            lastUpdatedDate ? `lastUpdated:ge:${lastUpdatedDate.format("YYYY-MM-DD")}` : null,
            groupFilter ? `${this.groupFilterName}.id:eq:${groupFilter}` : null,
            ...customFilters,
        ]);

        const listParams = cleanParams({ fields, filter, page, pageSize, order, paging });
        const collection = await this.getD2Model(d2).list(listParams);
        return { pager: collection.pager, objects: collection.toArray() };
    }

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
        return (objects: MetadataType[]) =>
            this.modelTransform(objects).map(
                ({ __type__, __mappingType__, ...object }: MetadataType) => ({
                    ...object,
                    __type__: __type__ ?? this.collectionName,
                    __mappingType__: __mappingType__ ?? this.mappingType,
                })
            );
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

    public static getMappingType(): string {
        return this.mappingType ?? this.collectionName;
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

export class OrganisationUnitModel extends D2Model {
    protected static metadataType = "organisationUnit";
    protected static collectionName = "organisationUnits" as const;
    protected static groupFilterName = "organisationUnitGroups" as const;
    protected static levelFilterName = "organisationUnitLevels" as const;

    protected static excludeRules = ["legendSets", "dataSets", "programs", "users"];
    protected static includeRules = [
        "attributes",
        "organisationUnitGroups",
        "organisationUnitGroups.attributes",
        "organisationUnitGroups.organisationUnitGroupSets",
        "organisationUnitGroups.organisationUnitGroupSets.attributes",
    ];

    protected static columns = organisationUnitsColumns;
    protected static details = organisationUnitsDetails;
    protected static fields = organisationUnitFields;

    public static async listMethod(
        d2: D2,
        filters: OrganisationUnitTableFilters,
        pagination: TablePagination
    ): Promise<TableList> {
        const { levelFilter = null } = filters || {};
        const newFilters = {
            ...filters,
            customFilters: _.compact([levelFilter ? `level:eq:${levelFilter}` : null]),
        };
        return super.listMethod(d2, newFilters, pagination);
    }
}

export class OrganisationUnitGroupModel extends D2Model {
    protected static metadataType = "organisationUnitGroup";
    protected static collectionName = "organisationUnitGroups" as const;

    protected static excludeRules = ["legendSets", "organisationUnits.organisationUnitGroups"];
    protected static includeRules = [
        "attributes",
        "organisationUnits",
        "organisationUnits.attributes",
        "organisationUnitGroupSets",
        "organisationUnitGroupSets.attributes",
    ];
}

export class OrganisationUnitGroupSetModel extends D2Model {
    protected static metadataType = "organisationUnitGroupSet";
    protected static collectionName = "organisationUnitGroupSets" as const;

    protected static excludeRules = [
        "organisationUnitGroups.organisationUnitGroupSets",
        "organisationUnitGroups.organisationUnits.organisationUnitGroups",
    ];
    protected static includeRules = [
        "attributes",
        "organisationUnitGroups",
        "organisationUnitGroups.organisationUnits",
        "organisationUnitGroups.organisationUnits.attributes",
    ];
}

export class OrganisationUnitLevelModel extends D2Model {
    protected static metadataType = "organisationUnitLevel";
    protected static collectionName = "organisationUnitLevels" as const;
}

export class DataElementModel extends D2Model {
    protected static metadataType = "dataElement";
    protected static collectionName = "dataElements" as const;
    protected static groupFilterName = "dataElementGroups" as const;

    protected static excludeRules = [
        "dataElementGroups.dataElements",
        "dataElementGroups.dataElementGroupSets.dataElementGroups",
    ];
    protected static includeRules = [
        "attributes",
        "dataSets",
        "legendSets",
        "optionSets",
        "optionSets.options",
        "categoryCombos",
        "categoryCombos.attributes",
        "categoryCombos.categoryOptionCombos",
        "categoryCombos.categoryOptionCombos.categoryOptions",
        "categoryCombos.categories",
        "dataElementGroups",
        "dataElementGroups.attributes",
        "dataElementGroups.dataElementGroupSets",
        "dataElementGroups.dataElementGroupSets.attributes",
    ];
}

export class DataElementGroupModel extends D2Model {
    protected static metadataType = "dataElementGroup";
    protected static collectionName = "dataElementGroups" as const;
    protected static fields = dataElementGroupFields;

    protected static excludeRules = ["legendSets", "dataElements.dataElementGroups"];
    protected static includeRules = [
        "attributes",
        "dataElements",
        "dataElements.attributes",
        "dataElementGroupSets",
        "dataElementGroupSets.attributes",
    ];
}

export class DataElementGroupSetModel extends D2Model {
    protected static metadataType = "dataElementGroupSet";
    protected static collectionName = "dataElementGroupSets" as const;
    protected static fields = dataElementGroupSetFields;

    protected static excludeRules = [
        "dataElementGroups.dataElementGroupSets",
        "dataElementGroups.dataElements.dataElementGroups",
    ];
    protected static includeRules = [
        "attributes",
        "dataElementGroups",
        "dataElementGroups.dataElements",
        "dataElementGroups.dataElements.attributes",
    ];
}

export class DataSetModel extends D2Model {
    protected static metadataType = "dataSet";
    protected static collectionName = "dataSets" as const;
    protected static fields = dataSetFields;

    protected static excludeRules = [
        "indicators.dataSets",
        "indicators.programs",
        "dataElements.dataSets",
        "dataElements.dataElementGroups.dataElements",
        "dataElements.dataElementGroups.dataElementGroupSets.dataElementGroups",
    ];
    protected static includeRules = [
        "attributes",
        "legendSets",
        "dataEntryForms",
        "sections",
        "categoryCombos",
        "categoryCombos.attributes",
        "categoryCombos.categoryOptionCombos",
        "categoryCombos.categoryOptionCombos.categoryOptions",
        "categoryCombos.categories",
        "indicators",
        "indicators.attributes",
        "indicators.legendSets",
        "indicators.indicatorTypes",
        "indicators.indicatorGroups",
        "indicators.indicatorGroups.attributes",
        "indicators.indicatorGroups.indicatorGroupSets",
        "dataElements",
        "dataElements.attributes",
        "dataElements.legendSets",
        "dataElements.optionSets",
        "dataElements.optionSets.options",
        "dataElements.categoryCombos",
        "dataElements.categoryCombos.attributes",
        "dataElements.categoryCombos.categoryOptionCombos",
        "dataElements.categoryCombos.categoryOptionCombos.categoryOptions",
        "dataElements.categoryCombos.categories",
        "dataElements.dataElementGroups",
        "dataElements.dataElementGroups.attributes",
        "dataElements.dataElementGroups.dataElementGroupSets",
        "dataElements.dataElementGroups.dataElementGroupSets.attributes",
    ];
}

export class CategoryOptionModel extends D2Model {
    protected static metadataType = "categoryOption";
    protected static collectionName = "categoryOptions" as const;
}

export class CategoryComboModel extends D2Model {
    protected static metadataType = "categoryCombo";
    protected static collectionName = "categoryCombos" as const;
}

export class ProgramModel extends D2Model {
    protected static metadataType = "program";
    protected static collectionName = "programs" as const;
    protected static fields = programFields;

    protected static excludeRules = [
        "programStages.dataElements.dataElementGroups.dataElements",
        "programStages.dataElements.dataElementGroups.dataElementGroupSets.dataElementGroups",
    ];
    protected static includeRules = [
        "attributes",
        "categoryCombos",
        "categoryCombos.attributes",
        "categoryCombos.categoryOptionCombos",
        "categoryCombos.categoryOptionCombos.categoryOptions",
        "categoryCombos.categories",
        "programIndicators",
        "programIndicators.programIndicatorGroups",
        "programIndicators.legendSets",
        "dataApprovalWorkflow",
        "dataApprovalWorkflow.dataApprovalLevels",
        "programStages",
        "programStages.programStageSections",
        "programStages.attributes",
        "programStages.dataElements",
        "programStages.dataElements.attributes",
        "programStages.dataElements.legendSets",
        "programStages.dataElements.optionSets",
        "programStages.dataElements.optionSets.options",
        "programStages.dataElements.categoryCombos",
        "programStages.dataElements.categoryCombos.attributes",
        "programStages.dataElements.categoryCombos.categoryOptionCombos",
        "programStages.dataElements.categoryCombos.categoryOptionCombos.categoryOptions",
        "programStages.dataElements.categoryCombos.categories",
        "programStages.dataElements.dataElementGroups",
        "programStages.dataElements.dataElementGroups.attributes",
        "programStages.dataElements.dataElementGroups.dataElementGroupSets",
        "programStages.dataElements.dataElementGroups.dataElementGroupSets.attributes",
        "programStages.programNotificationTemplates",
        "programRuleVariables",
        "trackedEntityTypes",
        "trackedEntityTypes.trackedEntityAttributes",
        "trackedEntityTypes.trackedEntityAttributes.legendSets",
        "trackedEntityAttributes",
        "trackedEntityAttributes.legendSets",
    ];
}

export class ProgramStageModel extends D2Model {
    protected static metadataType = "programStage";
    protected static collectionName = "programStages" as const;
}

export class OptionModel extends D2Model {
    protected static metadataType = "option";
    protected static collectionName = "options" as const;
}

export class IndicatorModel extends D2Model {
    protected static metadataType = "indicator";
    protected static collectionName = "indicators" as const;
    protected static groupFilterName = "indicatorGroups" as const;

    protected static excludeRules = ["dataSets", "programs"];
    protected static includeRules = [
        "attributes",
        "legendSets",
        "indicatorTypes",
        "indicatorGroups",
        "indicatorGroups.attributes",
        "indicatorGroups.indicatorGroupSets",
    ];
}

export class IndicatorGroupModel extends D2Model {
    protected static metadataType = "indicatorGroup";
    protected static collectionName = "indicatorGroups" as const;

    protected static excludeRules = ["legendSets", "indicators.indicatorGroups"];
    protected static includeRules = [
        "attributes",
        "indicators",
        "indicators.attributes",
        "indicators.indicatorTypes",
        "indicators.legendSets",
        "indicatorGroupSets",
        "indicatorGroupSets.attributes",
    ];
}

export class IndicatorGroupSetModel extends D2Model {
    protected static metadataType = "indicatorGroupSet";
    protected static collectionName = "indicatorGroupSets" as const;

    protected static excludeRules = [
        "indicatorGroups.indicatorGroupSets",
        "indicatorGroups.indicators.indicatorGroups",
    ];
    protected static includeRules = [
        "attributes",
        "indicatorGroups",
        "indicatorGroups.indicators",
        "indicatorGroups.indicators.attributes",
        "indicatorGroups.indicators.indicatorTypes",
        "indicatorGroups.indicators.legendSets",
    ];
}

export class ProgramIndicatorModel extends D2Model {
    protected static metadataType = "programIndicator";
    protected static collectionName = "programIndicators" as const;
    protected static groupFilterName = "programIndicatorGroups" as const;

    protected static excludeRules = ["programs"];
    protected static includeRules = [
        "attributes",
        "legendSets",
        "programIndicatorGroups",
        "programIndicatorGroups.attributes",
    ];
}

export class ProgramIndicatorGroupModel extends D2Model {
    protected static metadataType = "programIndicatorGroup";
    protected static collectionName = "programIndicatorGroups" as const;

    protected static excludeRules = ["legendSets", "programIndicators.programIndicatorGroups"];
    protected static includeRules = [
        "attributes",
        "programIndicators",
        "programIndicators.attributes",
    ];
}

export class ProgramRuleModel extends D2Model {
    protected static metadataType = "programRule";
    protected static collectionName = "programRules" as const;

    protected static excludeRules = [];
    protected static includeRules = ["attributes", "programRuleActions"];
}

export class ProgramRuleVariableModel extends D2Model {
    protected static metadataType = "programRuleVariable";
    protected static collectionName = "programRuleVariables" as const;

    protected static excludeRules = [];
    protected static includeRules = ["attributes"];
}

export class ValidationRuleModel extends D2Model {
    protected static metadataType = "validationRule";
    protected static collectionName = "validationRules" as const;
    protected static groupFilterName = "validationRuleGroups" as const;

    protected static excludeRules = ["legendSets"];
    protected static includeRules = [
        "attributes",
        "validationRuleGroups",
        "validationRuleGroups.attributes",
    ];
}

export class ValidationRuleGroupModel extends D2Model {
    protected static metadataType = "validationRuleGroup";
    protected static collectionName = "validationRuleGroups" as const;

    protected static excludeRules = ["legendSets", "validationRules.validationRuleGroups"];
    protected static includeRules = ["attributes", "validationRules", "validationRules.attributes"];
}

export class DashboardModel extends D2Model {
    protected static metadataType = "dashboard";
    protected static collectionName = "dashboards" as const;
    //protected static groupFilterName = "indicatorGroups" as const;

    protected static excludeRules = [];
    protected static includeRules = [
        "dashboardItems",
        "charts",
        "eventCharts",
        "pivotTables",
        "eventReports",
        "maps",
        "reports",
        "reportTables",
    ];
}

export class UserGroupModel extends D2Model {
    protected static metadataType = "userGroup";
    protected static collectionName = "userGroups" as const;

    protected static excludeRules = [];
    protected static includeRules = ["users", "users.userRoles"];
}

export class DataApprovalWorkflowModel extends D2Model {
    protected static metadataType = "dataApprovalWorkflow";
    protected static collectionName = "dataApprovalWorkflows" as const;
}

export function defaultModel(pascalCaseModelName: string): any {
    return class DefaultModel extends D2Model {
        protected static metadataType = pascalCaseModelName;
        protected static collectionName = pascalCaseModelName as keyof D2ModelSchemas;
    };
}
