import {
    categoryOptionColumns,
    categoryOptionFields,
    dataElementGroupFields,
    dataElementGroupSetFields,
    dataSetFields,
    documentColumns,
    documentDetails,
    documentFields,
    optionColumns,
    optionFields,
    organisationUnitFields,
    organisationUnitsColumns,
    organisationUnitsDetails,
    programFields,
    programIndicatorColumns,
    programIndicatorFields,
    programRuleActionsColumns,
    programRuleActionsFields,
    TrackedEntityAttributesFields,
} from "../../utils/d2";
import { D2Model, SearchFilter } from "./default";

// TODO: This concepts are our entity definition
// and should be in domain

export class CategoryModel extends D2Model {
    protected static metadataType = "category";
    protected static collectionName = "categories" as const;

    protected static excludeRules = [
        "categoryCombos",
        "categoryCombos.categoryOptionCombos",
        "categoryCombos.categories",
        "categoryCombos.categories.attributes",
        "categoryCombos.categories.categoryOptions",
        "categoryCombos.categories.categoryOptions.attributes",
    ];

    protected static includeRules = ["attributes", "categoryOptions", "categoryOptions.attributes"];
}

export class CategoryComboModel extends D2Model {
    protected static metadataType = "categoryCombo";
    protected static collectionName = "categoryCombos" as const;

    protected static excludeRules = [];
    protected static includeRules = [
        "categories",
        "categoryOptionCombos",
        "categories.attributes",
        "categories.categoryOptions",
        "categories.categoryOptions.attributes",
    ];
}

export class CategoryOptionModel extends D2Model {
    protected static metadataType = "categoryOption";
    protected static collectionName = "categoryOptions" as const;
    protected static fields = categoryOptionFields;
    protected static columns = categoryOptionColumns;

    protected static excludeRules = [
        "categories",
        "categories.attributes",
        "categories.categoryOptions",
        "categories.categoryOptions.attributes",
        "categoryOptionGroups",
        "categoryOptionGroups.attributes",
        "categoryOptionGroups.categoryOptions",
        "categoryOptionGroups.categoryOptions.attributes",
        "categoryOptionGroups.categoryOptionGroupSets",
        "categoryOptionGroups.categoryOptionGroupSets.attributes",
    ];
    protected static includeRules = ["attributes"];
}

export class CategoryOptionComboModel extends D2Model {
    protected static metadataType = "categoryOptionCombo";
    protected static collectionName = "categoryOptionCombos" as const;

    protected static excludeRules = [
        "categoryOptions.categories.categoryOptions",
        "categoryCombos.categories.categoryOptions.attributes",
        "categoryCombos.categories.categoryCombos",
        "categoryOptions.categoryOptionCombos",
    ];

    protected static includeRules = [
        "attributes",
        "categoryCombos",
        "categoryCombos.categories",
        "categoryCombos.categories.attributes",
        "categoryOptions",
        "categoryOptions.attributes",
    ];
}

export class CategoryOptionGroupModel extends D2Model {
    protected static metadataType = "categoryOptionGroup";
    protected static collectionName = "categoryOptionGroups" as const;

    protected static excludeRules = ["categoryOptionGroupSets", "categoryOptionGroupSets.attributes"];
    protected static includeRules = ["attributes", "categoryOptions", "categoryOptions.attributes"];
}

export class CategoryOptionGroupSetModel extends D2Model {
    protected static metadataType = "categoryOptionGroupSet";
    protected static collectionName = "categoryOptionGroupSets" as const;

    protected static excludeRules = [];
    protected static includeRules = [
        "attributes",
        "categoryOptionGroups",
        "categoryOptionGroups.attributes",
        "categoryOptionGroups.categoryOptions",
        "categoryOptionGroups.categoryOptions.attributes",
    ];
}

export class ChartModel extends D2Model {
    protected static metadataType = "chart";
    protected static collectionName = "charts" as const;

    protected static excludeRules = [];
    protected static includeRules = [
        "programIndicators",
        "indicators",
        "organisationUnitGroupSets",
        "organisationUnitGroups",
        "categoryOptionGroupSets",
        "categoryOptionGroups",
        "dataElementGroupSets",
        "dataElementGroups",
    ];
}

export class ReportTableModel extends D2Model {
    protected static metadataType = "reportTable";
    protected static collectionName = "reportTables" as const;

    protected static excludeRules = [];
    protected static includeRules = [
        "programIndicators",
        "indicators",
        "organisationUnitGroupSets",
        "organisationUnitGroups",
        "categoryOptionGroupSets",
        "categoryOptionGroups",
        "dataElementGroupSets",
        "dataElementGroups",
    ];
}

export class DashboardModel extends D2Model {
    protected static metadataType = "dashboard";
    protected static collectionName = "dashboards" as const;

    protected static excludeRules = [];
    protected static includeRules = [
        "charts",
        "charts.programIndicators",
        "charts.indicators",
        "charts.indicators.indicatorTypes",
        "charts.organisationUnitGroupSets",
        "charts.organisationUnitGroups",
        "charts.categoryOptionGroupSets",
        "charts.categoryOptionGroups",
        "charts.dataElementGroupSets",
        "charts.dataElementGroups",
        "eventCharts",
        "eventReports",
        "maps",
        "maps.mapViews.legendSets",
        "maps.mapViews.programIndicators",
        "maps.mapViews.indicators",
        "maps.mapViews.indicators.indicatorTypes",
        "reports",
        "reportTables",
        "reportTables.legendSets",
        "reportTables.programIndicators",
        "reportTables.indicators",
        "reportTables.indicators.indicatorTypes",
        "reportTables.organisationUnitGroupSets",
        "reportTables.organisationUnitGroups",
        "reportTables.categoryOptionGroupSets",
        "reportTables.categoryOptionGroups",
        "reportTables.dataElementGroupSets",
        "reportTables.dataElementGroups",
    ];
}

export class DataApprovalWorkflowModel extends D2Model {
    protected static metadataType = "dataApprovalWorkflow";
    protected static collectionName = "dataApprovalWorkflows" as const;
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

export class DataEntryFormModel extends D2Model {
    protected static metadataType = "dataEntryForm";
    protected static collectionName = "dataEntryForms" as const;
}

export class DataSetModel extends D2Model {
    protected static metadataType = "dataSet";
    protected static collectionName = "dataSets" as const;
    protected static fields = dataSetFields;

    protected static excludeRules = ["indicators.dataSets", "indicators.programs", "dataElements.dataSets"];
    protected static includeRules = [
        "attributes",
        "legendSets",
        "dataEntryForms",
        "sections",
        "categoryCombos",
        "categoryCombos.attributes",
        "categoryCombos.categoryOptionCombos",
        "categoryCombos.categoryOptionCombos.categoryOptions",
        "categoryCombos.categoryOptionCombos.categoryOptions.attributes",
        "categoryCombos.categories",
        "categoryCombos.categories.attributes",
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
        "dataElements.categoryCombos.categoryOptionCombos.categoryOptions.attributes",
        "dataElements.categoryCombos.categories",
        "dataElements.categoryCombos.categories.attributes",
        "dataElements.dataElementGroups",
        "dataElements.dataElementGroups.attributes",
        "dataElements.dataElementGroups.dataElementGroupSets",
        "dataElements.dataElementGroups.dataElementGroupSets.attributes",
    ];
}

export class DocumentsModel extends D2Model {
    protected static metadataType = "document";
    protected static collectionName = "documents" as const;

    protected static columns = documentColumns;
    protected static details = documentDetails;
    protected static fields = documentFields;

    protected static excludeRules = [];
    protected static includeRules = [];
}

export class EventChartModel extends D2Model {
    protected static metadataType = "eventChart";
    protected static collectionName = "eventCharts" as const;
}

export class EventReportModel extends D2Model {
    protected static metadataType = "eventReport";
    protected static collectionName = "eventReports" as const;
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

export class IndicatorTypeModel extends D2Model {
    protected static metadataType = "indicatorType";
    protected static collectionName = "indicatorTypes" as const;

    protected static excludeRules = [];
    protected static includeRules = [];
}

export class LegendSetModel extends D2Model {
    protected static metadataType = "legendSet";
    protected static collectionName = "legendSets" as const;

    protected static excludeRules = [];
    protected static includeRules = ["attributes"];
}

export class MapModel extends D2Model {
    protected static metadataType = "map";
    protected static collectionName = "maps" as const;

    protected static excludeRules = [];
    protected static includeRules = ["mapViews.legendSets", "mapViews.programIndicators", "mapViews.indicators"];
}

export class MapViewModel extends D2Model {
    protected static metadataType = "mapView";
    protected static collectionName = "mapViews" as const;

    protected static excludeRules = [];
    protected static includeRules = ["legendSets", "programIndicators", "indicators"];
}

export class OptionGroupModel extends D2Model {
    protected static metadataType = "optionGroup";
    protected static collectionName = "optionGroups" as const;

    protected static excludeRules = ["optionSets.options"];
    protected static includeRules = ["options", "optionSets"];
}

export class OptionSetModel extends D2Model {
    protected static metadataType = "optionSet";
    protected static collectionName = "optionSets" as const;

    protected static excludeRules = [];
    protected static includeRules = ["attributes", "options", "options.attributes"];
}

export class OptionModel extends D2Model {
    protected static metadataType = "option";
    protected static collectionName = "options" as const;
    protected static fields = optionFields;
    protected static columns = optionColumns;

    protected static excludeRules = [];
    protected static includeRules = ["attributes", "optionSets", "optionSets.attributes"];
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

export class ProgramModel extends D2Model {
    protected static metadataType = "program";
    protected static collectionName = "programs" as const;
    protected static fields = programFields;

    protected static excludeRules = [];
    protected static includeRules = [
        "attributes",
        "categoryCombos",
        "categoryCombos.attributes",
        "categoryCombos.categoryOptionCombos",
        "categoryCombos.categoryOptionCombos.categoryOptions",
        "categoryCombos.categoryOptionCombos.categoryOptions.attributes",
        "categoryCombos.categories",
        "categoryCombos.categories.attributes",
        "programIndicators",
        "programIndicators.programIndicatorGroups",
        "programIndicators.legendSets",
        "dataApprovalWorkflow",
        "dataApprovalWorkflow.dataApprovalLevels",
        "programStages",
        "programStages.dataEntryForms",
        "programStages.programStageSections",
        "programStages.programStageSections.dataElements",
        "programStages.programStageSections.dataElements.attributes",
        "programStages.programStageSections.dataElements.legendSets",
        "programStages.programStageSections.dataElements.legendSets.attributes",
        "programStages.programStageSections.dataElements.optionSets",
        "programStages.programStageSections.dataElements.optionSets.attributes",
        "programStages.programStageSections.dataElements.optionSets.options",
        "programStages.programStageSections.dataElements.optionSets.options.attributes",
        "programStages.programStageSections.dataElements.categoryCombos",
        "programStages.programStageSections.dataElements.categoryCombos.attributes",
        "programStages.programStageSections.dataElements.categoryCombos.categoryOptionCombos",
        "programStages.programStageSections.dataElements.categoryCombos.categoryOptionCombos.categoryOptions",
        "programStages.programStageSections.dataElements.categoryCombos.categories",
        "programStages.programStageSections.dataElements.dataElementGroups",
        "programStages.programStageSections.dataElements.dataElementGroups.attributes",
        "programStages.programStageSections.dataElements.dataElementGroups.dataElementGroupSets",
        "programStages.programStageSections.dataElements.dataElementGroups.dataElementGroupSets.attributes",
        "programStages.attributes",
        "programStages.dataElements",
        "programStages.dataElements.attributes",
        "programStages.dataElements.legendSets",
        "programStages.dataElements.legendSets.attributes",
        "programStages.dataElements.optionSets",
        "programStages.dataElements.optionSets.attributes",
        "programStages.dataElements.optionSets.options",
        "programStages.dataElements.optionSets.options.attributes",
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
        "trackedEntityTypes.trackedEntityAttributes.optionSets",
        "trackedEntityTypes.trackedEntityAttributes.optionSets.options",
        "trackedEntityAttributes",
        "trackedEntityAttributes.legendSets",
        "trackedEntityAttributes.optionSets",
        "trackedEntityAttributes.optionSets.options",
        "programNotificationTemplates",
        "programSections",
        "programSections.trackedEntityAttributes",
        "programRules",
        "programRules.programRuleActions",
        "programRules.programRuleActions.optionGroups",
    ];
}

export class ProgramStageModel extends D2Model {
    protected static metadataType = "programStage";
    protected static collectionName = "programStages" as const;

    protected static excludeRules = [];
    protected static includeRules = [
        "programs",
        "programStageSections",
        "programStageSections.dataElements",
        "programStageSections.dataElements.attributes",
        "programStageSections.dataElements.legendSets",
        "programStageSections.dataElements.legendSets.attributes",
        "programStageSections.dataElements.optionSets",
        "programStageSections.dataElements.optionSets.attributes",
        "programStageSections.dataElements.optionSets.options",
        "programStageSections.dataElements.optionSets.options.attributes",
        "programStageSections.dataElements.categoryCombos",
        "programStageSections.dataElements.categoryCombos.attributes",
        "programStageSections.dataElements.categoryCombos.categoryOptionCombos",
        "programStageSections.dataElements.categoryCombos.categoryOptionCombos.categoryOptions",
        "programStageSections.dataElements.categoryCombos.categories",
        "programStageSections.dataElements.dataElementGroups",
        "programStageSections.dataElements.dataElementGroups.attributes",
        "programStageSections.dataElements.dataElementGroups.dataElementGroupSets",
        "programStageSections.dataElements.dataElementGroups.dataElementGroupSets.attributes",
        "attributes",
        "dataElements",
        "dataElements.attributes",
        "dataElements.legendSets",
        "dataElements.legendSets.attributes",
        "dataElements.optionSets",
        "dataElements.optionSets.attributes",
        "dataElements.optionSets.options",
        "dataElements.optionSets.options.attributes",
        "dataElements.categoryCombos",
        "dataElements.categoryCombos.attributes",
        "dataElements.categoryCombos.categoryOptionCombos",
        "dataElements.categoryCombos.categoryOptionCombos.categoryOptions",
        "dataElements.categoryCombos.categoryOptionCombos.categoryOptions.attributes",
        "dataElements.categoryCombos.categories",
        "dataElements.categoryCombos.categories.attributes",
        "dataElements.dataElementGroups",
        "dataElements.dataElementGroups.attributes",
        "dataElements.dataElementGroups.dataElementGroupSets",
        "dataElements.dataElementGroups.dataElementGroupSets.attributes",
        "programNotificationTemplates",
    ];
}

export class ProgramStageSectionModel extends D2Model {
    protected static metadataType = "programStageSection";
    protected static collectionName = "programStageSections" as const;

    protected static excludeRules = [];
    protected static includeRules = [
        "attributes",
        "dataElements",
        "dataElements.attributes",
        "dataElements.legendSets",
        "dataElements.legendSets.attributes",
        "dataElements.optionSets",
        "dataElements.optionSets.attributes",
        "dataElements.optionSets.options",
        "dataElements.optionSets.options.attributes",
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

export class ProgramIndicatorModel extends D2Model {
    protected static metadataType = "programIndicator";
    protected static collectionName = "programIndicators" as const;
    protected static groupFilterName = "programIndicatorGroups" as const;
    protected static columns = programIndicatorColumns;
    protected static fields = programIndicatorFields;

    protected static excludeRules = [];
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
    protected static includeRules = ["attributes", "programIndicators", "programIndicators.attributes"];
}

export class ProgramRuleModel extends D2Model {
    protected static metadataType = "programRule";
    protected static collectionName = "programRules" as const;

    protected static excludeRules = [];
    protected static includeRules = ["attributes", "programRuleActions"];
}

export class ProgramRuleActionModel extends D2Model {
    protected static metadataType = "ProgramRuleAction";
    protected static collectionName = "programRuleActions" as const;
    protected static columns = programRuleActionsColumns;
    protected static fields = programRuleActionsFields;
    protected static searchFilter: SearchFilter = { field: "id", operator: "ilike" };

    protected static excludeRules = [];
    protected static includeRules = ["attributes"];
}

export class ProgramRuleVariableModel extends D2Model {
    protected static metadataType = "programRuleVariable";
    protected static collectionName = "programRuleVariables" as const;

    protected static excludeRules = [];
    protected static includeRules = ["attributes"];
}

export class ReportModel extends D2Model {
    protected static metadataType = "report";
    protected static collectionName = "reports" as const;
}

export class RelationshipTypeModel extends D2Model {
    protected static metadataType = "relationshipType";
    protected static collectionName = "relationshipTypes" as const;

    protected static excludeRules = [];
    protected static includeRules = [
        "trackedEntityTypes",
        "trackedEntityTypes.trackedEntityAttributes",
        "trackedEntityTypes.trackedEntityAttributes.legendSets",
        "trackedEntityTypes.trackedEntityAttributes.optionSets",
        "trackedEntityTypes.trackedEntityAttributes.optionSets.options",
    ];
}

export class SectionModel extends D2Model {
    protected static metadataType = "section";
    protected static collectionName = "sections" as const;

    protected static excludeRules = [];
    protected static includeRules = ["attributes"];
}

export class UserModel extends D2Model {
    protected static metadataType = "user";
    protected static collectionName = "users" as const;

    protected static excludeRules = ["userRoles.users", "userGroups.users"];
    protected static includeRules = ["attributes", "userRoles", "userGroups", "userGroups.attributes"];
}

export class UserGroupModel extends D2Model {
    protected static metadataType = "userGroup";
    protected static collectionName = "userGroups" as const;

    protected static excludeRules = [];
    protected static includeRules = ["attributes", "users", "users.userRoles"];
}

export class UserRoleModel extends D2Model {
    protected static metadataType = "userRole";
    protected static collectionName = "userRoles" as const;

    protected static excludeRules = ["users", "users.userRoles", "users.userGroups"];
    protected static includeRules = [];
}

export class ValidationRuleModel extends D2Model {
    protected static metadataType = "validationRule";
    protected static collectionName = "validationRules" as const;
    protected static groupFilterName = "validationRuleGroups" as const;

    protected static excludeRules = ["legendSets"];
    protected static includeRules = ["attributes", "validationRuleGroups", "validationRuleGroups.attributes"];
}

export class ValidationRuleGroupModel extends D2Model {
    protected static metadataType = "validationRuleGroup";
    protected static collectionName = "validationRuleGroups" as const;

    protected static excludeRules = ["legendSets", "validationRules.validationRuleGroups"];
    protected static includeRules = ["attributes", "validationRules", "validationRules.attributes"];
}

export class TrackedEntityTypeModel extends D2Model {
    protected static metadataType = "trackedEntityType";
    protected static collectionName = "trackedEntityTypes" as const;

    protected static excludeRules = [];

    protected static includeRules = [
        "trackedEntityAttributes",
        "trackedEntityAttributes.legendSets",
        "trackedEntityAttributes.optionSets",
        "trackedEntityAttributes.optionSets.options",
    ];
}

export class TrackedEntityAttributeModel extends D2Model {
    protected static metadataType = "trackedEntityAttribute";
    protected static collectionName = "trackedEntityAttributes" as const;
    protected static fields = TrackedEntityAttributesFields;

    protected static excludeRules = [];

    protected static includeRules = ["legendSets", "optionSets", "optionSets.options"];
}

export class SqlView extends D2Model {
    protected static metadataType = "sqlView";
    protected static collectionName = "sqlViews" as const;

    protected static includeRules = ["attributes"];
}
