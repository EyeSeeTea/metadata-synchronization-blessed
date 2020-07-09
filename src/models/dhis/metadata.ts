import {
    dataElementGroupFields,
    dataElementGroupSetFields,
    dataSetFields,
    organisationUnitFields,
    organisationUnitsColumns,
    organisationUnitsDetails,
    programFields,
} from "../../utils/d2";
import { D2Model } from "./default";

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

export class CategoryModel extends D2Model {
    protected static metadataType = "category";
    protected static collectionName = "categories" as const;
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

export class OptionSetModel extends D2Model {
    protected static metadataType = "optionSet";
    protected static collectionName = "optionSets" as const;
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
