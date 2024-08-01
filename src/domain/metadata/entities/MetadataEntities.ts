import { Ref } from "../../common/entities/Ref";
import {
    Access,
    AccessWithData,
    Axis,
    DimensionalKeywords,
    Geometry,
    Id,
    ProgramOwner,
    RelationshipConstraint,
    ReportingParams,
    Sharing,
    Style,
    Translation,
} from "../../common/entities/Schemas";

export type AnalyticsPeriodBoundary = {
    access: Access;
    analyticsPeriodBoundaryType:
        | "BEFORE_START_OF_REPORTING_PERIOD"
        | "BEFORE_END_OF_REPORTING_PERIOD"
        | "AFTER_START_OF_REPORTING_PERIOD"
        | "AFTER_END_OF_REPORTING_PERIOD";
    attributeValues: AttributeValue[];
    boundaryTarget: string;
    code: Id;
    created: string;
    createdBy: User;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    offsetPeriodType: string;
    offsetPeriods: number;
    publicAccess: string;
    sharing: Sharing;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type AnalyticsTableHook = {
    access: Access;
    analyticsTableType:
        | "DATA_VALUE"
        | "COMPLETENESS"
        | "COMPLETENESS_TARGET"
        | "ORG_UNIT_TARGET"
        | "EVENT"
        | "ENROLLMENT"
        | "VALIDATION_RESULT";
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    phase: "RESOURCE_TABLE_POPULATED" | "ANALYTICS_TABLE_POPULATED";
    publicAccess: string;
    resourceTableType:
        | "ORG_UNIT_STRUCTURE"
        | "DATA_SET_ORG_UNIT_CATEGORY"
        | "CATEGORY_OPTION_COMBO_NAME"
        | "DATA_ELEMENT_GROUP_SET_STRUCTURE"
        | "INDICATOR_GROUP_SET_STRUCTURE"
        | "ORG_UNIT_GROUP_SET_STRUCTURE"
        | "CATEGORY_STRUCTURE"
        | "DATA_ELEMENT_STRUCTURE"
        | "PERIOD_STRUCTURE"
        | "DATE_PERIOD_STRUCTURE"
        | "DATA_ELEMENT_CATEGORY_OPTION_COMBO"
        | "DATA_APPROVAL_REMAP_LEVEL"
        | "DATA_APPROVAL_MIN_LEVEL";
    sharing: Sharing;
    sql: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type Attribute = {
    access: Access;
    attributeValues: AttributeValue[];
    categoryAttribute: boolean;
    categoryOptionAttribute: boolean;
    categoryOptionComboAttribute: boolean;
    categoryOptionGroupAttribute: boolean;
    categoryOptionGroupSetAttribute: boolean;
    code: Id;
    constantAttribute: boolean;
    created: string;
    createdBy: User;
    dataElementAttribute: boolean;
    dataElementGroupAttribute: boolean;
    dataElementGroupSetAttribute: boolean;
    dataSetAttribute: boolean;
    description: string;
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    documentAttribute: boolean;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    href: string;
    id: Id;
    indicatorAttribute: boolean;
    indicatorGroupAttribute: boolean;
    lastUpdated: string;
    lastUpdatedBy: User;
    legendSetAttribute: boolean;
    mandatory: boolean;
    name: string;
    optionAttribute: boolean;
    optionSet: OptionSet;
    optionSetAttribute: boolean;
    organisationUnitAttribute: boolean;
    organisationUnitGroupAttribute: boolean;
    organisationUnitGroupSetAttribute: boolean;
    programAttribute: boolean;
    programIndicatorAttribute: boolean;
    programStageAttribute: boolean;
    publicAccess: string;
    sectionAttribute: boolean;
    sharing: Sharing;
    shortName: string;
    sortOrder: number;
    sqlViewAttribute: boolean;
    trackedEntityAttributeAttribute: boolean;
    trackedEntityTypeAttribute: boolean;
    translations: Translation[];
    unique: boolean;
    user: User;
    userAccesses: UserAccess[];
    userAttribute: boolean;
    userGroupAccesses: UserGroupAccess[];
    userGroupAttribute: boolean;
    validationRuleAttribute: boolean;
    validationRuleGroupAttribute: boolean;
    valueType:
        | "TEXT"
        | "LONG_TEXT"
        | "LETTER"
        | "PHONE_NUMBER"
        | "EMAIL"
        | "BOOLEAN"
        | "TRUE_ONLY"
        | "DATE"
        | "DATETIME"
        | "TIME"
        | "NUMBER"
        | "UNIT_INTERVAL"
        | "PERCENTAGE"
        | "INTEGER"
        | "INTEGER_POSITIVE"
        | "INTEGER_NEGATIVE"
        | "INTEGER_ZERO_OR_POSITIVE"
        | "TRACKER_ASSOCIATE"
        | "USERNAME"
        | "COORDINATE"
        | "ORGANISATION_UNIT"
        | "AGE"
        | "URL"
        | "FILE_RESOURCE"
        | "IMAGE";
};

export type AttributeValue = {
    attribute: Attribute;
    value: string;
};

export type Category = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    allItems: boolean;
    attributeValues: AttributeValue[];
    categoryCombos: CategoryCombo[];
    categoryOptions: CategoryOption[];
    code: Id;
    created: string;
    createdBy: User;
    dataDimension: boolean;
    dataDimensionType: "DISAGGREGATION" | "ATTRIBUTE";
    description: string;
    dimension: string;
    dimensionType:
        | "DATA_X"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "DATA_COLLAPSED"
        | "CATEGORY_OPTION_COMBO"
        | "ATTRIBUTE_OPTION_COMBO"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION_GROUP_SET"
        | "DATA_ELEMENT_GROUP_SET"
        | "ORGANISATION_UNIT_GROUP_SET"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY"
        | "OPTION_GROUP_SET"
        | "VALIDATION_RULE"
        | "STATIC"
        | "ORGANISATION_UNIT_LEVEL";
    dimensionalKeywords: DimensionalKeywords;
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filter: string;
    formName: string;
    href: string;
    id: Id;
    items: unknown[];
    lastUpdated: string;
    lastUpdatedBy: User;
    legendSet: LegendSet;
    name: string;
    programStage: ProgramStage;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type CategoryCombo = {
    access: Access;
    attributeValues: AttributeValue[];
    categories: Category[];
    categoryOptionCombos: CategoryOptionCombo[];
    code: Id;
    created: string;
    createdBy: User;
    dataDimensionType: "DISAGGREGATION" | "ATTRIBUTE";
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    isDefault: boolean;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    publicAccess: string;
    sharing: Sharing;
    skipTotal: boolean;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type CategoryDimension = {
    category: Category;
    categoryOptions: object;
};

export type CategoryOption = {
    access: AccessWithData;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeValues: AttributeValue[];
    categories: Category[];
    categoryOptionCombos: CategoryOptionCombo[];
    categoryOptionGroups: CategoryOptionGroup[];
    code: Id;
    created: string;
    createdBy: User;
    description: string;
    dimensionItem: string;
    dimensionItemType:
        | "DATA_ELEMENT"
        | "DATA_ELEMENT_OPERAND"
        | "INDICATOR"
        | "REPORTING_RATE"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION"
        | "OPTION_GROUP"
        | "DATA_ELEMENT_GROUP"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY_OPTION_GROUP";
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    endDate: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    href: string;
    id: Id;
    isDefault: boolean;
    lastUpdated: string;
    lastUpdatedBy: User;
    legendSet: LegendSet;
    legendSets: LegendSet[];
    name: string;
    organisationUnits: OrganisationUnit[];
    periodOffset: number;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    startDate: string;
    style: Style;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type CategoryOptionCombo = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeValues: AttributeValue[];
    categoryCombo: Ref;
    categoryOptions: Ref[];
    code: Id;
    created: string;
    createdBy: User;
    description: string;
    dimensionItem: string;
    dimensionItemType:
        | "DATA_ELEMENT"
        | "DATA_ELEMENT_OPERAND"
        | "INDICATOR"
        | "REPORTING_RATE"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION"
        | "OPTION_GROUP"
        | "DATA_ELEMENT_GROUP"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY_OPTION_GROUP";
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    href: string;
    id: Id;
    ignoreApproval: boolean;
    lastUpdated: string;
    lastUpdatedBy: User;
    legendSet: LegendSet;
    legendSets: LegendSet[];
    name: string;
    periodOffset: number;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type CategoryOptionGroup = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeValues: AttributeValue[];
    categoryOptions: CategoryOption[];
    code: Id;
    created: string;
    createdBy: User;
    dataDimensionType: "DISAGGREGATION" | "ATTRIBUTE";
    description: string;
    dimensionItem: string;
    dimensionItemType:
        | "DATA_ELEMENT"
        | "DATA_ELEMENT_OPERAND"
        | "INDICATOR"
        | "REPORTING_RATE"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION"
        | "OPTION_GROUP"
        | "DATA_ELEMENT_GROUP"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY_OPTION_GROUP";
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    groupSets: CategoryOptionGroupSet[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    legendSet: LegendSet;
    legendSets: LegendSet[];
    name: string;
    periodOffset: number;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type CategoryOptionGroupSet = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    allItems: boolean;
    attributeValues: AttributeValue[];
    categoryOptionGroups: CategoryOptionGroup[];
    code: Id;
    created: string;
    createdBy: User;
    dataDimension: boolean;
    dataDimensionType: "DISAGGREGATION" | "ATTRIBUTE";
    description: string;
    dimension: string;
    dimensionType:
        | "DATA_X"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "DATA_COLLAPSED"
        | "CATEGORY_OPTION_COMBO"
        | "ATTRIBUTE_OPTION_COMBO"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION_GROUP_SET"
        | "DATA_ELEMENT_GROUP_SET"
        | "ORGANISATION_UNIT_GROUP_SET"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY"
        | "OPTION_GROUP_SET"
        | "VALIDATION_RULE"
        | "STATIC"
        | "ORGANISATION_UNIT_LEVEL";
    dimensionalKeywords: DimensionalKeywords;
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filter: string;
    formName: string;
    href: string;
    id: Id;
    items: unknown[];
    lastUpdated: string;
    lastUpdatedBy: User;
    legendSet: LegendSet;
    name: string;
    programStage: ProgramStage;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type CategoryOptionGroupSetDimension = {
    categoryOptionGroupSet: CategoryOptionGroupSet;
    categoryOptionGroups: object;
};

export type Chart = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeDimensions: unknown[];
    attributeValues: AttributeValue[];
    baseLineLabel: string;
    baseLineValue: number;
    category: string;
    categoryDimensions: CategoryDimension[];
    categoryOptionGroupSetDimensions: CategoryOptionGroupSetDimension[];
    code: Id;
    columns: unknown[];
    completedOnly: boolean;
    created: string;
    createdBy: User;
    cumulativeValues: boolean;
    dataDimensionItems: unknown[];
    dataElementDimensions: TrackedEntityDataElementDimension[];
    dataElementGroupSetDimensions: DataElementGroupSetDimension[];
    description: string;
    digitGroupSeparator: "COMMA" | "SPACE" | "NONE";
    displayBaseLineLabel: string;
    displayDescription: string;
    displayDomainAxisLabel: string;
    displayFormName: string;
    displayName: string;
    displayRangeAxisLabel: string;
    displayShortName: string;
    displaySubtitle: string;
    displayTargetLineLabel: string;
    displayTitle: string;
    domainAxisLabel: string;
    endDate: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filterDimensions: string[];
    filters: unknown[];
    formName: string;
    hideEmptyRowItems: "NONE" | "BEFORE_FIRST" | "AFTER_LAST" | "BEFORE_FIRST_AFTER_LAST" | "ALL";
    hideLegend: boolean;
    hideSubtitle: boolean;
    hideTitle: boolean;
    href: string;
    id: Id;
    interpretations: Interpretation[];
    itemOrganisationUnitGroups: OrganisationUnitGroup[];
    lastUpdated: string;
    lastUpdatedBy: User;
    legendDisplayStrategy: "FIXED" | "BY_DATA_ITEM";
    legendSet: LegendSet;
    name: string;
    noSpaceBetweenColumns: boolean;
    orgUnitField: string;
    organisationUnitGroupSetDimensions: OrganisationUnitGroupSetDimension[];
    organisationUnitLevels: number[];
    organisationUnits: OrganisationUnit[];
    parentGraphMap: Map;
    percentStackedValues: boolean;
    periods: Ref[];
    programIndicatorDimensions: TrackedEntityProgramIndicatorDimension[];
    publicAccess: string;
    rangeAxisDecimals: number;
    rangeAxisLabel: string;
    rangeAxisMaxValue: number;
    rangeAxisMinValue: number;
    rangeAxisSteps: number;
    regressionType: "NONE" | "LINEAR" | "POLYNOMIAL" | "LOESS";
    relativePeriods: unknown;
    rows: unknown[];
    series: string;
    seriesItems: unknown[];
    sharing: Sharing;
    shortName: string;
    showData: boolean;
    sortOrder: number;
    startDate: string;
    subscribed: boolean;
    subscribers: string[];
    subtitle: string;
    targetLineLabel: string;
    targetLineValue: number;
    timeField: string;
    title: string;
    topLimit: number;
    translations: Translation[];
    type:
        | "COLUMN"
        | "STACKED_COLUMN"
        | "BAR"
        | "STACKED_BAR"
        | "STACKED_AREA"
        | "LINE"
        | "AREA"
        | "PIE"
        | "RADAR"
        | "GAUGE"
        | "YEAR_OVER_YEAR_LINE"
        | "YEAR_OVER_YEAR_COLUMN"
        | "SINGLE_VALUE"
        | "SCATTER"
        | "BUBBLE";
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    userOrgUnitType: "DATA_CAPTURE" | "DATA_OUTPUT" | "TEI_SEARCH";
    userOrganisationUnit: boolean;
    userOrganisationUnitChildren: boolean;
    userOrganisationUnitGrandChildren: boolean;
    yearlySeries: string[];
};

export type Constant = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    description: string;
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    value: number;
};

export type Dashboard = {
    access: Access;
    allowedFilters: string[];
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    dashboardItems: DashboardItem[];
    description: string;
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    href: string;
    id: Id;
    itemCount: number;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    publicAccess: string;
    restrictFilters: boolean;
    sharing: Sharing;
    shortName: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type DashboardItem = {
    access: Access;
    appKey: string;
    attributeValues: AttributeValue[];
    chart: Chart;
    code: Id;
    contentCount: number;
    created: string;
    createdBy: User;
    displayName: string;
    eventChart: EventChart;
    eventReport: EventReport;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    height: number;
    href: string;
    id: Id;
    interpretationCount: number;
    interpretationLikeCount: number;
    lastUpdated: string;
    lastUpdatedBy: User;
    map: Map;
    messages: boolean;
    name: string;
    publicAccess: string;
    reportTable: ReportTable;
    reports: Report[];
    resources: Document[];
    shape: "NORMAL" | "DOUBLE_WIDTH" | "FULL_WIDTH";
    sharing: Sharing;
    text: string;
    translations: Translation[];
    type:
        | "VISUALIZATION"
        | "CHART"
        | "EVENT_CHART"
        | "MAP"
        | "REPORT_TABLE"
        | "EVENT_REPORT"
        | "USERS"
        | "REPORTS"
        | "RESOURCES"
        | "TEXT"
        | "MESSAGES"
        | "APP";
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    users: User[];
    visualization: Visualization;
    width: number;
    x: number;
    y: number;
};

export type DataApprovalLevel = {
    access: Access;
    attributeValues: AttributeValue[];
    categoryOptionGroupSet: CategoryOptionGroupSet;
    code: Id;
    created: string;
    createdBy: User;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    level: number;
    name: string;
    orgUnitLevel: number;
    orgUnitLevelName: string;
    publicAccess: string;
    sharing: Sharing;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type DataApprovalWorkflow = {
    access: Access;
    attributeValues: AttributeValue[];
    categoryCombo: CategoryCombo;
    code: Id;
    created: string;
    createdBy: User;
    dataApprovalLevels: DataApprovalLevel[];
    dataSets: DataSet[];
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    periodType: string;
    publicAccess: string;
    sharing: Sharing;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type DataElement = {
    access: Access;
    aggregationLevels: number[];
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeValues: AttributeValue[];
    categoryCombo: CategoryCombo;
    code: Id;
    commentOptionSet: OptionSet;
    created: string;
    createdBy: User;
    dataElementGroups: DataElementGroup[];
    dataSetElements: DataSetElement[];
    description: string;
    dimensionItem: string;
    dimensionItemType:
        | "DATA_ELEMENT"
        | "DATA_ELEMENT_OPERAND"
        | "INDICATOR"
        | "REPORTING_RATE"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION"
        | "OPTION_GROUP"
        | "DATA_ELEMENT_GROUP"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY_OPTION_GROUP";
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    domainType: "AGGREGATE" | "TRACKER";
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    fieldMask: string;
    formName: string;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    legendSet: LegendSet;
    legendSets: LegendSet[];
    name: string;
    optionSet: OptionSet;
    optionSetValue: boolean;
    periodOffset: number;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    style: Style;
    translations: Translation[];
    url: string;
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    valueType:
        | "TEXT"
        | "LONG_TEXT"
        | "LETTER"
        | "PHONE_NUMBER"
        | "EMAIL"
        | "BOOLEAN"
        | "TRUE_ONLY"
        | "DATE"
        | "DATETIME"
        | "TIME"
        | "NUMBER"
        | "UNIT_INTERVAL"
        | "PERCENTAGE"
        | "INTEGER"
        | "INTEGER_POSITIVE"
        | "INTEGER_NEGATIVE"
        | "INTEGER_ZERO_OR_POSITIVE"
        | "TRACKER_ASSOCIATE"
        | "USERNAME"
        | "COORDINATE"
        | "ORGANISATION_UNIT"
        | "AGE"
        | "URL"
        | "FILE_RESOURCE"
        | "IMAGE";
    valueTypeOptions: unknown;
    zeroIsSignificant: boolean;
};

export type DataElementGroup = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    dataElements: DataElement[];
    description: string;
    dimensionItem: string;
    dimensionItemType:
        | "DATA_ELEMENT"
        | "DATA_ELEMENT_OPERAND"
        | "INDICATOR"
        | "REPORTING_RATE"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION"
        | "OPTION_GROUP"
        | "DATA_ELEMENT_GROUP"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY_OPTION_GROUP";
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    groupSets: DataElementGroupSet[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    legendSet: LegendSet;
    legendSets: LegendSet[];
    name: string;
    periodOffset: number;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type DataElementGroupSet = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    allItems: boolean;
    attributeValues: AttributeValue[];
    code: Id;
    compulsory: boolean;
    created: string;
    createdBy: User;
    dataDimension: boolean;
    dataDimensionType: "DISAGGREGATION" | "ATTRIBUTE";
    dataElementGroups: DataElementGroup[];
    description: string;
    dimension: string;
    dimensionType:
        | "DATA_X"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "DATA_COLLAPSED"
        | "CATEGORY_OPTION_COMBO"
        | "ATTRIBUTE_OPTION_COMBO"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION_GROUP_SET"
        | "DATA_ELEMENT_GROUP_SET"
        | "ORGANISATION_UNIT_GROUP_SET"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY"
        | "OPTION_GROUP_SET"
        | "VALIDATION_RULE"
        | "STATIC"
        | "ORGANISATION_UNIT_LEVEL";
    dimensionalKeywords: DimensionalKeywords;
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filter: string;
    formName: string;
    href: string;
    id: Id;
    items: unknown[];
    lastUpdated: string;
    lastUpdatedBy: User;
    legendSet: LegendSet;
    name: string;
    programStage: ProgramStage;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type DataElementGroupSetDimension = {
    dataElementGroupSet: DataElementGroupSet;
    dataElementGroups: object;
};

export type DataElementOperand = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeOptionCombo: CategoryOptionCombo;
    attributeValues: AttributeValue[];
    categoryOptionCombo: CategoryOptionCombo;
    code: Id;
    created: string;
    createdBy: User;
    dataElement: DataElement;
    description: string;
    dimensionItem: string;
    dimensionItemType:
        | "DATA_ELEMENT"
        | "DATA_ELEMENT_OPERAND"
        | "INDICATOR"
        | "REPORTING_RATE"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION"
        | "OPTION_GROUP"
        | "DATA_ELEMENT_GROUP"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY_OPTION_GROUP";
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    legendSet: LegendSet;
    legendSets: LegendSet[];
    name: string;
    periodOffset: number;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type DataEntryForm = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    format: number;
    href: string;
    htmlCode: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    publicAccess: string;
    sharing: Sharing;
    style: "COMFORTABLE" | "NORMAL" | "COMPACT" | "NONE";
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type DataInputPeriod = {
    closingDate: string;
    openingDate: string;
    period: Ref;
};

export type DataSet = {
    access: AccessWithData;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeValues: AttributeValue[];
    categoryCombo: CategoryCombo;
    code: Id;
    compulsoryDataElementOperands: DataElementOperand[];
    compulsoryFieldsCompleteOnly: boolean;
    created: string;
    createdBy: User;
    dataElementDecoration: boolean;
    dataEntryForm: DataEntryForm;
    dataInputPeriods: DataInputPeriod[];
    dataSetElements: DataSetElement[];
    description: string;
    dimensionItem: string;
    dimensionItemType:
        | "DATA_ELEMENT"
        | "DATA_ELEMENT_OPERAND"
        | "INDICATOR"
        | "REPORTING_RATE"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION"
        | "OPTION_GROUP"
        | "DATA_ELEMENT_GROUP"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY_OPTION_GROUP";
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    expiryDays: number;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    fieldCombinationRequired: boolean;
    formName: string;
    formType: "DEFAULT" | "CUSTOM" | "SECTION" | "SECTION_MULTIORG";
    href: string;
    id: Id;
    indicators: Indicator[];
    interpretations: Interpretation[];
    lastUpdated: string;
    lastUpdatedBy: User;
    legendSet: LegendSet;
    legendSets: LegendSet[];
    mobile: boolean;
    name: string;
    noValueRequiresComment: boolean;
    notificationRecipients: UserGroup;
    notifyCompletingUser: boolean;
    openFuturePeriods: number;
    openPeriodsAfterCoEndDate: number;
    organisationUnits: OrganisationUnit[];
    periodOffset: number;
    periodType: string;
    publicAccess: string;
    renderAsTabs: boolean;
    renderHorizontally: boolean;
    sections: Section[];
    sharing: Sharing;
    shortName: string;
    skipOffline: boolean;
    style: Style;
    timelyDays: number;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    validCompleteOnly: boolean;
    version: number;
    workflow: DataApprovalWorkflow;
};

export type DataSetElement = {
    categoryCombo: CategoryCombo;
    dataElement: DataElement;
    dataSet: DataSet;
};

export type DataSetNotificationTemplate = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    dataSetNotificationTrigger: "DATA_SET_COMPLETION" | "SCHEDULED_DAYS";
    dataSets: DataSet[];
    deliveryChannels: never[];
    displayMessageTemplate: string;
    displayName: string;
    displaySubjectTemplate: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    messageTemplate: string;
    name: string;
    notificationRecipient: "ORGANISATION_UNIT_CONTACT" | "USER_GROUP";
    notifyParentOrganisationUnitOnly: boolean;
    notifyUsersInHierarchyOnly: boolean;
    publicAccess: string;
    recipientUserGroup: UserGroup;
    relativeScheduledDays: number;
    sendStrategy: "COLLECTIVE_SUMMARY" | "SINGLE_NOTIFICATION";
    sharing: Sharing;
    subjectTemplate: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type Document = {
    access: Access;
    attachment: boolean;
    attributeValues: AttributeValue[];
    code: Id;
    contentType: string;
    created: string;
    createdBy: User;
    displayName: string;
    external: boolean;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    publicAccess: string;
    sharing: Sharing;
    translations: Translation[];
    url: string;
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type EventChart = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeDimensions: unknown[];
    attributeValueDimension: TrackedEntityAttribute;
    attributeValues: AttributeValue[];
    baseLineLabel: string;
    baseLineValue: number;
    categoryDimensions: CategoryDimension[];
    categoryOptionGroupSetDimensions: CategoryOptionGroupSetDimension[];
    code: Id;
    collapseDataDimensions: boolean;
    columnDimensions: string[];
    columns: unknown[];
    completedOnly: boolean;
    created: string;
    createdBy: User;
    cumulativeValues: boolean;
    dataDimensionItems: unknown[];
    dataElementDimensions: TrackedEntityDataElementDimension[];
    dataElementGroupSetDimensions: DataElementGroupSetDimension[];
    dataElementValueDimension: DataElement;
    description: string;
    digitGroupSeparator: "COMMA" | "SPACE" | "NONE";
    displayBaseLineLabel: string;
    displayDescription: string;
    displayDomainAxisLabel: string;
    displayFormName: string;
    displayName: string;
    displayRangeAxisLabel: string;
    displayShortName: string;
    displaySubtitle: string;
    displayTargetLineLabel: string;
    displayTitle: string;
    domainAxisLabel: string;
    endDate: string;
    eventStatus: "ACTIVE" | "COMPLETED" | "VISITED" | "SCHEDULE" | "OVERDUE" | "SKIPPED";
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filterDimensions: string[];
    filters: unknown[];
    formName: string;
    hideEmptyRowItems: "NONE" | "BEFORE_FIRST" | "AFTER_LAST" | "BEFORE_FIRST_AFTER_LAST" | "ALL";
    hideLegend: boolean;
    hideNaData: boolean;
    hideSubtitle: boolean;
    hideTitle: boolean;
    href: string;
    id: Id;
    interpretations: Interpretation[];
    itemOrganisationUnitGroups: OrganisationUnitGroup[];
    lastUpdated: string;
    lastUpdatedBy: User;
    legendDisplayStrategy: "FIXED" | "BY_DATA_ITEM";
    legendSet: LegendSet;
    name: string;
    noSpaceBetweenColumns: boolean;
    orgUnitField: string;
    organisationUnitGroupSetDimensions: OrganisationUnitGroupSetDimension[];
    organisationUnitLevels: number[];
    organisationUnits: OrganisationUnit[];
    outputType: "EVENT" | "ENROLLMENT" | "TRACKED_ENTITY_INSTANCE";
    parentGraphMap: Map;
    percentStackedValues: boolean;
    periods: Ref[];
    program: Program;
    programIndicatorDimensions: TrackedEntityProgramIndicatorDimension[];
    programStage: ProgramStage;
    programStatus: "ACTIVE" | "COMPLETED" | "CANCELLED";
    publicAccess: string;
    rangeAxisDecimals: number;
    rangeAxisLabel: string;
    rangeAxisMaxValue: number;
    rangeAxisMinValue: number;
    rangeAxisSteps: number;
    regressionType: "NONE" | "LINEAR" | "POLYNOMIAL" | "LOESS";
    relativePeriods: unknown;
    rowDimensions: string[];
    rows: unknown[];
    sharing: Sharing;
    shortName: string;
    showData: boolean;
    sortOrder: number;
    startDate: string;
    subscribed: boolean;
    subscribers: string[];
    subtitle: string;
    targetLineLabel: string;
    targetLineValue: number;
    timeField: string;
    title: string;
    topLimit: number;
    translations: Translation[];
    type:
        | "COLUMN"
        | "STACKED_COLUMN"
        | "BAR"
        | "STACKED_BAR"
        | "STACKED_AREA"
        | "LINE"
        | "AREA"
        | "PIE"
        | "RADAR"
        | "GAUGE"
        | "YEAR_OVER_YEAR_LINE"
        | "YEAR_OVER_YEAR_COLUMN"
        | "SINGLE_VALUE"
        | "SCATTER"
        | "BUBBLE";
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    userOrgUnitType: "DATA_CAPTURE" | "DATA_OUTPUT" | "TEI_SEARCH";
    userOrganisationUnit: boolean;
    userOrganisationUnitChildren: boolean;
    userOrganisationUnitGrandChildren: boolean;
    value: unknown;
    yearlySeries: string[];
};

export type EventReport = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeDimensions: unknown[];
    attributeValueDimension: TrackedEntityAttribute;
    attributeValues: AttributeValue[];
    categoryDimensions: CategoryDimension[];
    categoryOptionGroupSetDimensions: CategoryOptionGroupSetDimension[];
    code: Id;
    colSubTotals: boolean;
    colTotals: boolean;
    collapseDataDimensions: boolean;
    columnDimensions: string[];
    columns: unknown[];
    completedOnly: boolean;
    created: string;
    createdBy: User;
    dataDimensionItems: unknown[];
    dataElementDimensions: TrackedEntityDataElementDimension[];
    dataElementGroupSetDimensions: DataElementGroupSetDimension[];
    dataElementValueDimension: DataElement;
    dataType: "AGGREGATED_VALUES" | "EVENTS";
    description: string;
    digitGroupSeparator: "COMMA" | "SPACE" | "NONE";
    displayDensity: "COMFORTABLE" | "NORMAL" | "COMPACT" | "NONE";
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    displaySubtitle: string;
    displayTitle: string;
    endDate: string;
    eventStatus: "ACTIVE" | "COMPLETED" | "VISITED" | "SCHEDULE" | "OVERDUE" | "SKIPPED";
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filterDimensions: string[];
    filters: unknown[];
    fontSize: "LARGE" | "NORMAL" | "SMALL";
    formName: string;
    hideEmptyRows: boolean;
    hideNaData: boolean;
    hideSubtitle: boolean;
    hideTitle: boolean;
    href: string;
    id: Id;
    interpretations: Interpretation[];
    itemOrganisationUnitGroups: OrganisationUnitGroup[];
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    orgUnitField: string;
    organisationUnitGroupSetDimensions: OrganisationUnitGroupSetDimension[];
    organisationUnitLevels: number[];
    organisationUnits: OrganisationUnit[];
    outputType: "EVENT" | "ENROLLMENT" | "TRACKED_ENTITY_INSTANCE";
    parentGraphMap: Map;
    periods: Ref[];
    program: Program;
    programIndicatorDimensions: TrackedEntityProgramIndicatorDimension[];
    programStage: ProgramStage;
    programStatus: "ACTIVE" | "COMPLETED" | "CANCELLED";
    publicAccess: string;
    relativePeriods: unknown;
    rowDimensions: string[];
    rowSubTotals: boolean;
    rowTotals: boolean;
    rows: unknown[];
    sharing: Sharing;
    shortName: string;
    showDimensionLabels: boolean;
    showHierarchy: boolean;
    sortOrder: number;
    startDate: string;
    subscribed: boolean;
    subscribers: string[];
    subtitle: string;
    timeField: string;
    title: string;
    topLimit: number;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    userOrgUnitType: "DATA_CAPTURE" | "DATA_OUTPUT" | "TEI_SEARCH";
    userOrganisationUnit: boolean;
    userOrganisationUnitChildren: boolean;
    userOrganisationUnitGrandChildren: boolean;
    value: unknown;
};

export type Expression = {
    description: string;
    displayDescription: string;
    expression: string;
    missingValueStrategy: "SKIP_IF_ANY_VALUE_MISSING" | "SKIP_IF_ALL_VALUES_MISSING" | "NEVER_SKIP";
    slidingWindow: boolean;
    translations: Translation[];
};

export type ExternalFileResource = {
    access: Access;
    accessToken: string;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    displayName: string;
    expires: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    fileResource: FileResource;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    publicAccess: string;
    sharing: Sharing;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ExternalMapLayer = {
    access: Access;
    attributeValues: AttributeValue[];
    attribution: string;
    code: Id;
    created: string;
    createdBy: User;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    imageFormat: "PNG" | "JPG";
    lastUpdated: string;
    lastUpdatedBy: User;
    layers: string;
    legendSet: LegendSet;
    legendSetUrl: string;
    mapLayerPosition: "BASEMAP" | "OVERLAY";
    mapService: "WMS" | "TMS" | "XYZ";
    name: string;
    publicAccess: string;
    sharing: Sharing;
    translations: Translation[];
    url: string;
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type FileResource = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    contentLength: string;
    contentMd5: string;
    contentType: string;
    created: string;
    createdBy: User;
    displayName: string;
    domain: "DATA_VALUE" | "PUSH_ANALYSIS" | "DOCUMENT" | "MESSAGE_ATTACHMENT" | "USER_AVATAR";
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    hasMultipleStorageFiles: boolean;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    publicAccess: string;
    sharing: Sharing;
    storageStatus: "NONE" | "PENDING" | "FAILED" | "STORED";
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type Icon = {};

export type Indicator = {
    access: Access;
    aggregateExportAttributeOptionCombo: string;
    aggregateExportCategoryOptionCombo: string;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    annualized: boolean;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    dataSets: DataSet[];
    decimals: number;
    denominator: string;
    denominatorDescription: string;
    description: string;
    dimensionItem: string;
    dimensionItemType:
        | "DATA_ELEMENT"
        | "DATA_ELEMENT_OPERAND"
        | "INDICATOR"
        | "REPORTING_RATE"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION"
        | "OPTION_GROUP"
        | "DATA_ELEMENT_GROUP"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY_OPTION_GROUP";
    displayDenominatorDescription: string;
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayNumeratorDescription: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    href: string;
    id: Id;
    indicatorGroups: IndicatorGroup[];
    indicatorType: IndicatorType;
    lastUpdated: string;
    lastUpdatedBy: User;
    legendSet: LegendSet;
    legendSets: LegendSet[];
    name: string;
    numerator: string;
    numeratorDescription: string;
    periodOffset: number;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    style: Style;
    translations: Translation[];
    url: string;
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type IndicatorGroup = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    description: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    indicatorGroupSet: IndicatorGroupSet;
    indicators: Indicator[];
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    publicAccess: string;
    sharing: Sharing;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type IndicatorGroupSet = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    compulsory: boolean;
    created: string;
    createdBy: User;
    description: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    indicatorGroups: IndicatorGroup[];
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    publicAccess: string;
    sharing: Sharing;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type IndicatorType = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    displayName: string;
    externalAccess: boolean;
    factor: number;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    number: boolean;
    publicAccess: string;
    sharing: Sharing;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type Interpretation = {
    access: Access;
    attributeValues: AttributeValue[];
    chart: Chart;
    code: Id;
    comments: InterpretationComment[];
    created: string;
    createdBy: User;
    dataSet: DataSet;
    displayName: string;
    eventChart: EventChart;
    eventReport: EventReport;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    likedBy: User[];
    likes: number;
    map: Map;
    mentions: unknown[];
    name: string;
    organisationUnit: OrganisationUnit;
    period: Ref;
    publicAccess: string;
    reportTable: ReportTable;
    sharing: Sharing;
    text: string;
    translations: Translation[];
    type: "VISUALIZATION" | "REPORT_TABLE" | "CHART" | "MAP" | "EVENT_REPORT" | "EVENT_CHART" | "DATASET_REPORT";
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    visualization: Visualization;
};

export type InterpretationComment = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    mentions: unknown[];
    name: string;
    publicAccess: string;
    sharing: Sharing;
    text: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type JobConfiguration = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    configurable: boolean;
    created: string;
    createdBy: User;
    cronExpression: string;
    delay: number;
    displayName: string;
    enabled: boolean;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    jobParameters: unknown;
    jobStatus: "RUNNING" | "COMPLETED" | "STOPPED" | "SCHEDULED" | "DISABLED" | "FAILED" | "NOT_STARTED";
    jobType:
        | "DATA_STATISTICS"
        | "DATA_INTEGRITY"
        | "RESOURCE_TABLE"
        | "ANALYTICS_TABLE"
        | "CONTINUOUS_ANALYTICS_TABLE"
        | "DATA_SYNC"
        | "TRACKER_PROGRAMS_DATA_SYNC"
        | "EVENT_PROGRAMS_DATA_SYNC"
        | "FILE_RESOURCE_CLEANUP"
        | "IMAGE_PROCESSING"
        | "META_DATA_SYNC"
        | "SMS_SEND"
        | "SEND_SCHEDULED_MESSAGE"
        | "PROGRAM_NOTIFICATIONS"
        | "VALIDATION_RESULTS_NOTIFICATION"
        | "CREDENTIALS_EXPIRY_ALERT"
        | "MONITORING"
        | "PUSH_ANALYSIS"
        | "PREDICTOR"
        | "DATA_SET_NOTIFICATION"
        | "REMOVE_USED_OR_EXPIRED_RESERVED_VALUES"
        | "TRACKER_IMPORT_JOB"
        | "TRACKER_IMPORT_NOTIFICATION_JOB"
        | "TRACKER_IMPORT_RULE_ENGINE_JOB"
        | "LEADER_ELECTION"
        | "LEADER_RENEWAL"
        | "COMPLETE_DATA_SET_REGISTRATION_IMPORT"
        | "DATAVALUE_IMPORT_INTERNAL"
        | "METADATA_IMPORT"
        | "DATAVALUE_IMPORT"
        | "EVENT_IMPORT"
        | "ENROLLMENT_IMPORT"
        | "TEI_IMPORT"
        | "DISABLE_INACTIVE_USERS"
        | "MOCK"
        | "GML_IMPORT"
        | "ANALYTICSTABLE_UPDATE"
        | "PROGRAM_DATA_SYNC";
    lastExecuted: string;
    lastExecutedStatus: "RUNNING" | "COMPLETED" | "STOPPED" | "SCHEDULED" | "DISABLED" | "FAILED" | "NOT_STARTED";
    lastRuntimeExecution: string;
    lastUpdated: string;
    lastUpdatedBy: User;
    leaderOnlyJob: boolean;
    name: string;
    nextExecutionTime: string;
    publicAccess: string;
    schedulingType: "CRON" | "FIXED_DELAY";
    sharing: Sharing;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    userUid: string;
};

export type KeyJsonValue = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    key: string;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    namespace: string;
    publicAccess: string;
    sharing: Sharing;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    value: string;
};

export type Legend = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    color: string;
    created: string;
    createdBy: User;
    displayName: string;
    endValue: number;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    image: string;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    publicAccess: string;
    sharing: Sharing;
    startValue: number;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type LegendSet = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    legends: Legend[];
    name: string;
    publicAccess: string;
    sharing: Sharing;
    symbolizer: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type Map = {
    access: Access;
    attributeValues: AttributeValue[];
    basemap: string;
    code: Id;
    created: string;
    createdBy: User;
    description: string;
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    href: string;
    id: Id;
    interpretations: Interpretation[];
    lastUpdated: string;
    lastUpdatedBy: User;
    latitude: number;
    longitude: number;
    mapViews: MapView[];
    name: string;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    subscribed: boolean;
    subscribers: string[];
    title: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    zoom: number;
};

export type MapView = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    areaRadius: number;
    attributeDimensions: unknown[];
    attributeValues: AttributeValue[];
    categoryDimensions: CategoryDimension[];
    categoryOptionGroupSetDimensions: CategoryOptionGroupSetDimension[];
    classes: number;
    code: Id;
    colorHigh: string;
    colorLow: string;
    colorScale: string;
    columnDimensions: string[];
    columns: unknown[];
    completedOnly: boolean;
    config: string;
    created: string;
    createdBy: User;
    dataDimensionItems: unknown[];
    dataElementDimensions: TrackedEntityDataElementDimension[];
    dataElementGroupSetDimensions: DataElementGroupSetDimension[];
    description: string;
    digitGroupSeparator: "COMMA" | "SPACE" | "NONE";
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    displaySubtitle: string;
    displayTitle: string;
    endDate: string;
    eventClustering: boolean;
    eventCoordinateField: string;
    eventPointColor: string;
    eventPointRadius: number;
    eventStatus: "ACTIVE" | "COMPLETED" | "SCHEDULE" | "OVERDUE" | "SKIPPED";
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filterDimensions: string[];
    filters: unknown[];
    followUp: boolean;
    formName: string;
    hidden: boolean;
    hideSubtitle: boolean;
    hideTitle: boolean;
    href: string;
    id: Id;
    interpretations: Interpretation[];
    itemOrganisationUnitGroups: OrganisationUnitGroup[];
    labelFontColor: string;
    labelFontSize: string;
    labelFontStyle: string;
    labelFontWeight: string;
    labels: boolean;
    lastUpdated: string;
    lastUpdatedBy: User;
    layer: string;
    legendSet: LegendSet;
    method: number;
    name: string;
    noDataColor: string;
    opacity: number;
    orgUnitField: string;
    organisationUnitGroupSet: OrganisationUnitGroupSet;
    organisationUnitGroupSetDimensions: OrganisationUnitGroupSetDimension[];
    organisationUnitLevels: number[];
    organisationUnitSelectionMode: "SELECTED" | "CHILDREN" | "DESCENDANTS" | "ACCESSIBLE" | "CAPTURE" | "ALL";
    organisationUnits: OrganisationUnit[];
    parentGraph: string;
    parentGraphMap: Map;
    parentLevel: number;
    periods: Ref[];
    program: Program;
    programIndicatorDimensions: TrackedEntityProgramIndicatorDimension[];
    programStage: ProgramStage;
    programStatus: "ACTIVE" | "COMPLETED" | "CANCELLED";
    publicAccess: string;
    radiusHigh: number;
    radiusLow: number;
    relativePeriods: unknown;
    renderingStrategy: "SINGLE" | "SPLIT_BY_PERIOD" | "TIMELINE";
    rows: unknown[];
    sharing: Sharing;
    shortName: string;
    sortOrder: number;
    startDate: string;
    styleDataItem: object;
    subscribed: boolean;
    subscribers: string[];
    subtitle: string;
    thematicMapType: "CHOROPLETH" | "BUBBLE";
    timeField: string;
    title: string;
    topLimit: number;
    trackedEntityType: TrackedEntityType;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    userOrgUnitType: "DATA_CAPTURE" | "DATA_OUTPUT" | "TEI_SEARCH";
    userOrganisationUnit: boolean;
    userOrganisationUnitChildren: boolean;
    userOrganisationUnitGrandChildren: boolean;
};

export type MessageConversation = {
    access: Access;
    assignee: User;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    followUp: boolean;
    href: string;
    id: Id;
    lastMessage: string;
    lastSender: User;
    lastSenderFirstname: string;
    lastSenderSurname: string;
    lastUpdated: string;
    lastUpdatedBy: User;
    messageCount: number;
    messageType: "PRIVATE" | "SYSTEM" | "VALIDATION_RESULT" | "TICKET";
    messages: unknown[];
    name: string;
    priority: "NONE" | "LOW" | "MEDIUM" | "HIGH";
    publicAccess: string;
    read: boolean;
    sharing: Sharing;
    status: "NONE" | "OPEN" | "PENDING" | "INVALID" | "SOLVED";
    subject: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userFirstname: string;
    userGroupAccesses: UserGroupAccess[];
    userMessages: unknown[];
    userSurname: string;
};

export type MetadataVersion = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    hashCode: string;
    href: string;
    id: Id;
    importDate: string;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    publicAccess: string;
    sharing: Sharing;
    translations: Translation[];
    type: "BEST_EFFORT" | "ATOMIC";
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type MinMaxDataElement = {
    dataElement: DataElement;
    generated: boolean;
    max: number;
    min: number;
    optionCombo: CategoryOptionCombo;
    source: OrganisationUnit;
};

export type OAuth2Client = {
    access: Access;
    attributeValues: AttributeValue[];
    cid: Id;
    code: Id;
    created: string;
    createdBy: User;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    grantTypes: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    publicAccess: string;
    redirectUris: string[];
    secret: string;
    sharing: Sharing;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type Option = {
    access: Access;
    attributeValues: AttributeValue[];
    code: string;
    created: string;
    createdBy: Partial<User>;
    description: string;
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Partial<User>;
    name: string;
    optionSet: Ref;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    sortOrder: number;
    style: Style;
    translations: Translation[];
    user: Partial<User>;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type OptionGroup = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: Partial<User>;
    description: string;
    dimensionItem: string;
    dimensionItemType:
        | "DATA_ELEMENT"
        | "DATA_ELEMENT_OPERAND"
        | "INDICATOR"
        | "REPORTING_RATE"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION"
        | "OPTION_GROUP"
        | "DATA_ELEMENT_GROUP"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY_OPTION_GROUP";
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Partial<User>;
    legendSet: LegendSet;
    legendSets: LegendSet[];
    name: string;
    optionSet: Ref;
    options: Ref[];
    periodOffset: number;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    translations: Translation[];
    user: Partial<User>;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type OptionGroupSet = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    allItems: boolean;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    dataDimension: boolean;
    dataDimensionType: "DISAGGREGATION" | "ATTRIBUTE";
    description: string;
    dimension: string;
    dimensionType:
        | "DATA_X"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "DATA_COLLAPSED"
        | "CATEGORY_OPTION_COMBO"
        | "ATTRIBUTE_OPTION_COMBO"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION_GROUP_SET"
        | "DATA_ELEMENT_GROUP_SET"
        | "ORGANISATION_UNIT_GROUP_SET"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY"
        | "OPTION_GROUP_SET"
        | "VALIDATION_RULE"
        | "STATIC"
        | "ORGANISATION_UNIT_LEVEL";
    dimensionalKeywords: DimensionalKeywords;
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filter: string;
    formName: string;
    href: string;
    id: Id;
    items: unknown[];
    lastUpdated: string;
    lastUpdatedBy: User;
    legendSet: LegendSet;
    name: string;
    optionGroups: OptionGroup[];
    optionSet: OptionSet;
    programStage: ProgramStage;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type OptionSet = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: Partial<User>;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Partial<User>;
    name: string;
    options: Ref[];
    publicAccess: string;
    sharing: Sharing;
    translations: Translation[];
    user: Partial<User>;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    valueType:
        | "TEXT"
        | "LONG_TEXT"
        | "LETTER"
        | "PHONE_NUMBER"
        | "EMAIL"
        | "BOOLEAN"
        | "TRUE_ONLY"
        | "DATE"
        | "DATETIME"
        | "TIME"
        | "NUMBER"
        | "UNIT_INTERVAL"
        | "PERCENTAGE"
        | "INTEGER"
        | "INTEGER_POSITIVE"
        | "INTEGER_NEGATIVE"
        | "INTEGER_ZERO_OR_POSITIVE"
        | "TRACKER_ASSOCIATE"
        | "USERNAME"
        | "COORDINATE"
        | "ORGANISATION_UNIT"
        | "AGE"
        | "URL"
        | "FILE_RESOURCE"
        | "IMAGE";
    version: number;
};

export type OrganisationUnit = {
    access: Access;
    address: string;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    ancestors: OrganisationUnit[];
    attributeValues: AttributeValue[];
    children: OrganisationUnit[];
    closedDate: string;
    code: Id;
    comment: string;
    contactPerson: string;
    created: string;
    createdBy: User;
    dataSets: DataSet[];
    description: string;
    dimensionItem: string;
    dimensionItemType:
        | "DATA_ELEMENT"
        | "DATA_ELEMENT_OPERAND"
        | "INDICATOR"
        | "REPORTING_RATE"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION"
        | "OPTION_GROUP"
        | "DATA_ELEMENT_GROUP"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY_OPTION_GROUP";
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    email: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    geometry: Geometry;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    leaf: boolean;
    legendSet: LegendSet;
    legendSets: LegendSet[];
    level: number;
    memberCount: number;
    name: string;
    openingDate: string;
    organisationUnitGroups: OrganisationUnitGroup[];
    parent: OrganisationUnit;
    path: string;
    periodOffset: number;
    phoneNumber: string;
    programs: Program[];
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    translations: Translation[];
    type: string;
    url: string;
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    users: User[];
};

export type OrganisationUnitGroup = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeValues: AttributeValue[];
    code: Id;
    color: string;
    created: string;
    createdBy: User;
    description: string;
    dimensionItem: string;
    dimensionItemType:
        | "DATA_ELEMENT"
        | "DATA_ELEMENT_OPERAND"
        | "INDICATOR"
        | "REPORTING_RATE"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION"
        | "OPTION_GROUP"
        | "DATA_ELEMENT_GROUP"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY_OPTION_GROUP";
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    featureType: "NONE" | "MULTI_POLYGON" | "POLYGON" | "POINT" | "SYMBOL";
    formName: string;
    geometry: Geometry;
    groupSets: OrganisationUnitGroupSet[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    legendSet: LegendSet;
    legendSets: LegendSet[];
    name: string;
    organisationUnits: OrganisationUnit[];
    periodOffset: number;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    symbol: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type OrganisationUnitGroupSet = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    allItems: boolean;
    attributeValues: AttributeValue[];
    code: Id;
    compulsory: boolean;
    created: string;
    createdBy: User;
    dataDimension: boolean;
    dataDimensionType: "DISAGGREGATION" | "ATTRIBUTE";
    description: string;
    dimension: string;
    dimensionType:
        | "DATA_X"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "DATA_COLLAPSED"
        | "CATEGORY_OPTION_COMBO"
        | "ATTRIBUTE_OPTION_COMBO"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION_GROUP_SET"
        | "DATA_ELEMENT_GROUP_SET"
        | "ORGANISATION_UNIT_GROUP_SET"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY"
        | "OPTION_GROUP_SET"
        | "VALIDATION_RULE"
        | "STATIC"
        | "ORGANISATION_UNIT_LEVEL";
    dimensionalKeywords: DimensionalKeywords;
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filter: string;
    formName: string;
    href: string;
    id: Id;
    includeSubhierarchyInAnalytics: boolean;
    items: unknown[];
    lastUpdated: string;
    lastUpdatedBy: User;
    legendSet: LegendSet;
    name: string;
    organisationUnitGroups: OrganisationUnitGroup[];
    programStage: ProgramStage;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type OrganisationUnitGroupSetDimension = {
    organisationUnitGroupSet: OrganisationUnitGroupSet;
    organisationUnitGroups: object;
};

export type OrganisationUnitLevel = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    level: number;
    name: string;
    offlineLevels: number;
    publicAccess: string;
    sharing: Sharing;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type Predictor = {
    access: Access;
    annualSampleCount: number;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    description: string;
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    generator: Expression;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    organisationUnitLevels: OrganisationUnitLevel[];
    output: DataElement;
    outputCombo: CategoryOptionCombo;
    periodType: string;
    predictorGroups: PredictorGroup[];
    publicAccess: string;
    sampleSkipTest: Expression;
    sequentialSampleCount: number;
    sequentialSkipCount: number;
    sharing: Sharing;
    shortName: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type PredictorGroup = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    description: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    predictors: Predictor[];
    publicAccess: string;
    sharing: Sharing;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type Program = {
    access: AccessWithData;
    accessLevel: "OPEN" | "AUDITED" | "PROTECTED" | "CLOSED";
    attributeValues: AttributeValue[];
    categoryCombo: CategoryCombo;
    code: Id;
    completeEventsExpiryDays: number;
    created: string;
    createdBy: User;
    dataEntryForm: DataEntryForm;
    description: string;
    displayDescription: string;
    displayEnrollmentDateLabel: string;
    displayFormName: string;
    displayFrontPageList: boolean;
    displayIncidentDate: boolean;
    displayIncidentDateLabel: string;
    displayName: string;
    displayShortName: string;
    enrollmentDateLabel: string;
    expiryDays: number;
    expiryPeriodType: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    featureType: "NONE" | "MULTI_POLYGON" | "POLYGON" | "POINT" | "SYMBOL";
    formName: string;
    href: string;
    id: Id;
    ignoreOverdueEvents: boolean;
    incidentDateLabel: string;
    lastUpdated: string;
    lastUpdatedBy: User;
    maxTeiCountToReturn: number;
    minAttributesRequiredToSearch: number;
    name: string;
    notificationTemplates: ProgramNotificationTemplate[];
    onlyEnrollOnce: boolean;
    organisationUnits: OrganisationUnit[];
    programIndicators: ProgramIndicator[];
    programRuleVariables: ProgramRuleVariable[];
    programSections: ProgramSection[];
    programStages: ProgramStage[];
    programTrackedEntityAttributes: ProgramTrackedEntityAttribute[];
    programType: "WITH_REGISTRATION" | "WITHOUT_REGISTRATION";
    publicAccess: string;
    registration: boolean;
    relatedProgram: Program;
    selectEnrollmentDatesInFuture: boolean;
    selectIncidentDatesInFuture: boolean;
    sharing: Sharing;
    shortName: string;
    skipOffline: boolean;
    style: Style;
    trackedEntityType: TrackedEntityType;
    translations: Translation[];
    useFirstStageDuringRegistration: boolean;
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    userRoles: UserAuthorityGroup[];
    version: number;
    withoutRegistration: boolean;
};

export type ProgramDataElementDimensionItem = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    dataElement: DataElement;
    description: string;
    dimensionItem: string;
    dimensionItemType:
        | "DATA_ELEMENT"
        | "DATA_ELEMENT_OPERAND"
        | "INDICATOR"
        | "REPORTING_RATE"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION"
        | "OPTION_GROUP"
        | "DATA_ELEMENT_GROUP"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY_OPTION_GROUP";
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    legendSet: LegendSet;
    legendSets: LegendSet[];
    name: string;
    periodOffset: number;
    program: Program;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    valueType:
        | "TEXT"
        | "LONG_TEXT"
        | "LETTER"
        | "PHONE_NUMBER"
        | "EMAIL"
        | "BOOLEAN"
        | "TRUE_ONLY"
        | "DATE"
        | "DATETIME"
        | "TIME"
        | "NUMBER"
        | "UNIT_INTERVAL"
        | "PERCENTAGE"
        | "INTEGER"
        | "INTEGER_POSITIVE"
        | "INTEGER_NEGATIVE"
        | "INTEGER_ZERO_OR_POSITIVE"
        | "TRACKER_ASSOCIATE"
        | "USERNAME"
        | "COORDINATE"
        | "ORGANISATION_UNIT"
        | "AGE"
        | "URL"
        | "FILE_RESOURCE"
        | "IMAGE";
};

export type ProgramIndicator = {
    access: Access;
    aggregateExportAttributeOptionCombo: string;
    aggregateExportCategoryOptionCombo: string;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    analyticsPeriodBoundaries: AnalyticsPeriodBoundary[];
    analyticsType: "EVENT" | "ENROLLMENT";
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    decimals: number;
    description: string;
    dimensionItem: string;
    dimensionItemType:
        | "DATA_ELEMENT"
        | "DATA_ELEMENT_OPERAND"
        | "INDICATOR"
        | "REPORTING_RATE"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION"
        | "OPTION_GROUP"
        | "DATA_ELEMENT_GROUP"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY_OPTION_GROUP";
    displayDescription: string;
    displayFormName: string;
    displayInForm: boolean;
    displayName: string;
    displayShortName: string;
    expression: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filter: string;
    formName: string;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    legendSet: LegendSet;
    legendSets: LegendSet[];
    name: string;
    periodOffset: number;
    program: Program;
    programIndicatorGroups: ProgramIndicatorGroup[];
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    style: Style;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramIndicatorGroup = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    description: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    programIndicators: ProgramIndicator[];
    publicAccess: string;
    sharing: Sharing;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramInstance = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    completedBy: string;
    created: string;
    createdAtClient: string;
    createdBy: User;
    deleted: boolean;
    displayName: string;
    endDate: string;
    enrollmentDate: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    followup: boolean;
    geometry: Geometry;
    href: string;
    id: Id;
    incidentDate: string;
    lastUpdated: string;
    lastUpdatedAtClient: string;
    lastUpdatedBy: User;
    messageConversations: MessageConversation[];
    name: string;
    organisationUnit: OrganisationUnit;
    program: Program;
    programStageInstances: ProgramStageInstance[];
    publicAccess: string;
    relationshipItems: unknown[];
    sharing: Sharing;
    status: "ACTIVE" | "COMPLETED" | "CANCELLED";
    storedBy: string;
    trackedEntityComments: unknown[];
    trackedEntityInstance: TrackedEntityInstance;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramNotificationTemplate = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    deliveryChannels: never[];
    displayMessageTemplate: string;
    displayName: string;
    displaySubjectTemplate: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    messageTemplate: string;
    name: string;
    notificationRecipient:
        | "TRACKED_ENTITY_INSTANCE"
        | "ORGANISATION_UNIT_CONTACT"
        | "USERS_AT_ORGANISATION_UNIT"
        | "USER_GROUP"
        | "PROGRAM_ATTRIBUTE"
        | "DATA_ELEMENT";
    notificationTrigger:
        | "ENROLLMENT"
        | "COMPLETION"
        | "PROGRAM_RULE"
        | "SCHEDULED_DAYS_DUE_DATE"
        | "SCHEDULED_DAYS_INCIDENT_DATE"
        | "SCHEDULED_DAYS_ENROLLMENT_DATE";
    notifyParentOrganisationUnitOnly: boolean;
    notifyUsersInHierarchyOnly: boolean;
    publicAccess: string;
    recipientDataElement: DataElement;
    recipientProgramAttribute: TrackedEntityAttribute;
    recipientUserGroup: UserGroup;
    relativeScheduledDays: number;
    sharing: Sharing;
    subjectTemplate: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramRule = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    condition: string;
    created: string;
    createdBy: User;
    description: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Partial<User>;
    name: string;
    priority: number;
    program: Ref;
    programRuleActions: Ref[];
    programStage: ProgramStage;
    publicAccess: string;
    sharing: Sharing;
    translations: Translation[];
    user: Partial<User>;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramRuleAction = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    content: string;
    created: string;
    createdBy: User;
    data: string;
    dataElement: DataElement;
    displayContent: string;
    displayName: string;
    evaluationEnvironments: never[];
    evaluationTime: "ON_DATA_ENTRY" | "ON_COMPLETE" | "ALWAYS";
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    location: string;
    name: string;
    option: Option;
    optionGroup: OptionGroup;
    programIndicator: ProgramIndicator;
    programRule: ProgramRule;
    programRuleActionType:
        | "DISPLAYTEXT"
        | "DISPLAYKEYVALUEPAIR"
        | "HIDEFIELD"
        | "HIDESECTION"
        | "HIDEPROGRAMSTAGE"
        | "ASSIGN"
        | "SHOWWARNING"
        | "WARNINGONCOMPLETE"
        | "SHOWERROR"
        | "ERRORONCOMPLETE"
        | "CREATEEVENT"
        | "SETMANDATORYFIELD"
        | "SENDMESSAGE"
        | "SCHEDULEMESSAGE"
        | "HIDEOPTION"
        | "SHOWOPTIONGROUP"
        | "HIDEOPTIONGROUP";
    programStage: ProgramStage;
    programStageSection: ProgramStageSection;
    publicAccess: string;
    sharing: Sharing;
    templateUid: string;
    trackedEntityAttribute: TrackedEntityAttribute;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramRuleVariable = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    dataElement: DataElement;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    program: Ref;
    programRuleVariableSourceType:
        | "DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE"
        | "DATAELEMENT_NEWEST_EVENT_PROGRAM"
        | "DATAELEMENT_CURRENT_EVENT"
        | "DATAELEMENT_PREVIOUS_EVENT"
        | "CALCULATED_VALUE"
        | "TEI_ATTRIBUTE";
    programStage: ProgramStage;
    publicAccess: string;
    sharing: Sharing;
    trackedEntityAttribute: TrackedEntityAttribute;
    translations: Translation[];
    useCodeForOptionSet: boolean;
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramSection = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    description: string;
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    program: Program;
    publicAccess: string;
    renderType: unknown;
    sharing: Sharing;
    shortName: string;
    sortOrder: number;
    style: Style;
    trackedEntityAttributes: TrackedEntityAttribute[];
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramStage = {
    access: AccessWithData;
    allowGenerateNextVisit: boolean;
    attributeValues: AttributeValue[];
    autoGenerateEvent: boolean;
    blockEntryForm: boolean;
    code: Id;
    created: string;
    createdBy: User;
    dataEntryForm: DataEntryForm;
    description: string;
    displayDescription: string;
    displayDueDateLabel: string;
    displayExecutionDateLabel: string;
    displayFormName: string;
    displayGenerateEventBox: boolean;
    displayName: string;
    displayShortName: string;
    dueDateLabel: string;
    enableUserAssignment: boolean;
    executionDateLabel: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    featureType: "NONE" | "MULTI_POLYGON" | "POLYGON" | "POINT" | "SYMBOL";
    formName: string;
    formType: "DEFAULT" | "CUSTOM" | "SECTION" | "SECTION_MULTIORG";
    generatedByEnrollmentDate: boolean;
    hideDueDate: boolean;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    minDaysFromStart: number;
    name: string;
    nextScheduleDate: DataElement;
    notificationTemplates: ProgramNotificationTemplate[];
    openAfterEnrollment: boolean;
    periodType: string;
    preGenerateUID: boolean;
    program: Program;
    programStageDataElements: ProgramStageDataElement[];
    programStageSections: ProgramStageSection[];
    publicAccess: string;
    remindCompleted: boolean;
    repeatable: boolean;
    reportDateToUse: string;
    sharing: Sharing;
    shortName: string;
    sortOrder: number;
    standardInterval: number;
    style: Style;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    validationStrategy: "ON_COMPLETE" | "ON_UPDATE_AND_INSERT";
};

export type ProgramStageDataElement = {
    access: Access;
    allowFutureDate: boolean;
    allowProvidedElsewhere: boolean;
    attributeValues: AttributeValue[];
    code: Id;
    compulsory: boolean;
    created: string;
    createdBy: User;
    dataElement: DataElement;
    displayInReports: boolean;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    programStage: ProgramStage;
    publicAccess: string;
    renderOptionsAsRadio: boolean;
    renderType: unknown;
    sharing: Sharing;
    skipAnalytics: boolean;
    skipSynchronization: boolean;
    sortOrder: number;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramStageInstance = {
    access: Access;
    assignedUser: User;
    attributeOptionCombo: CategoryOptionCombo;
    attributeValues: AttributeValue[];
    code: Id;
    comments: unknown[];
    completed: boolean;
    completedBy: string;
    completedDate: string;
    creatableInSearchScope: boolean;
    created: string;
    createdAtClient: string;
    createdBy: User;
    createdByUserInfo: unknown;
    deleted: boolean;
    displayName: string;
    dueDate: string;
    eventDataValues: unknown[];
    eventDate: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    geometry: Geometry;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedAtClient: string;
    lastUpdatedBy: User;
    lastUpdatedByUserInfo: unknown;
    messageConversations: MessageConversation[];
    name: string;
    organisationUnit: OrganisationUnit;
    programInstance: ProgramInstance;
    programStage: ProgramStage;
    publicAccess: string;
    relationshipItems: unknown[];
    sharing: Sharing;
    status: "ACTIVE" | "COMPLETED" | "VISITED" | "SCHEDULE" | "OVERDUE" | "SKIPPED";
    storedBy: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramStageInstanceFilter = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    description: string;
    displayDescription: string;
    displayName: string;
    eventQueryCriteria: unknown;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    program: Id;
    programStage: Id;
    publicAccess: string;
    sharing: Sharing;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramStageSection = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    dataElements: DataElement[];
    description: string;
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    programIndicators: ProgramIndicator[];
    programStage: ProgramStage;
    publicAccess: string;
    renderType: unknown;
    sharing: Sharing;
    shortName: string;
    sortOrder: number;
    style: Style;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramTrackedEntityAttribute = {
    access: Access;
    allowFutureDate: boolean;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    displayInList: boolean;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    mandatory: boolean;
    name: string;
    program: Program;
    programTrackedEntityAttributeGroups: ProgramTrackedEntityAttributeGroup[];
    publicAccess: string;
    renderOptionsAsRadio: boolean;
    renderType: unknown;
    searchable: boolean;
    sharing: Sharing;
    sortOrder: number;
    trackedEntityAttribute: TrackedEntityAttribute;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    valueType:
        | "TEXT"
        | "LONG_TEXT"
        | "LETTER"
        | "PHONE_NUMBER"
        | "EMAIL"
        | "BOOLEAN"
        | "TRUE_ONLY"
        | "DATE"
        | "DATETIME"
        | "TIME"
        | "NUMBER"
        | "UNIT_INTERVAL"
        | "PERCENTAGE"
        | "INTEGER"
        | "INTEGER_POSITIVE"
        | "INTEGER_NEGATIVE"
        | "INTEGER_ZERO_OR_POSITIVE"
        | "TRACKER_ASSOCIATE"
        | "USERNAME"
        | "COORDINATE"
        | "ORGANISATION_UNIT"
        | "AGE"
        | "URL"
        | "FILE_RESOURCE"
        | "IMAGE";
};

export type ProgramTrackedEntityAttributeDimensionItem = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attribute: TrackedEntityAttribute;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    description: string;
    dimensionItem: string;
    dimensionItemType:
        | "DATA_ELEMENT"
        | "DATA_ELEMENT_OPERAND"
        | "INDICATOR"
        | "REPORTING_RATE"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION"
        | "OPTION_GROUP"
        | "DATA_ELEMENT_GROUP"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY_OPTION_GROUP";
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    legendSet: LegendSet;
    legendSets: LegendSet[];
    name: string;
    periodOffset: number;
    program: Program;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramTrackedEntityAttributeGroup = {
    access: Access;
    attributeValues: AttributeValue[];
    attributes: ProgramTrackedEntityAttribute[];
    code: Id;
    created: string;
    createdBy: User;
    description: string;
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    translations: Translation[];
    uniqunessType: "NONE" | "STRICT" | "VALIDATION";
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type PushAnalysis = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    dashboard: Dashboard;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    message: string;
    name: string;
    publicAccess: string;
    recipientUserGroups: UserGroup[];
    sharing: Sharing;
    title: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type Relationship = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    description: string;
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    from: unknown;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    publicAccess: string;
    relationshipType: RelationshipType;
    sharing: Sharing;
    shortName: string;
    style: Style;
    to: unknown;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type RelationshipType = {
    access: AccessWithData;
    attributeValues: AttributeValue[];
    bidirectional: boolean;
    code: Id;
    created: string;
    createdBy: User;
    description: string;
    displayFromToName: string;
    displayName: string;
    displayToFromName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    fromConstraint: RelationshipConstraint;
    fromToName: string;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    publicAccess: string;
    sharing: Sharing;
    toConstraint: RelationshipConstraint;
    toFromName: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type Report = {
    access: Access;
    attributeValues: AttributeValue[];
    cacheStrategy:
        | "NO_CACHE"
        | "CACHE_1_MINUTE"
        | "CACHE_5_MINUTES"
        | "CACHE_10_MINUTES"
        | "CACHE_15_MINUTES"
        | "CACHE_30_MINUTES"
        | "CACHE_1_HOUR"
        | "CACHE_6AM_TOMORROW"
        | "CACHE_TWO_WEEKS"
        | "RESPECT_SYSTEM_SETTING";
    code: Id;
    created: string;
    createdBy: User;
    designContent: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    publicAccess: string;
    relativePeriods: unknown;
    reportParams: ReportingParams;
    sharing: Sharing;
    translations: Translation[];
    type: "JASPER_REPORT_TABLE" | "JASPER_JDBC" | "HTML";
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    visualization: Visualization;
};

export type ReportTable = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeDimensions: unknown[];
    attributeValues: AttributeValue[];
    categoryDimensions: CategoryDimension[];
    categoryOptionGroupSetDimensions: CategoryOptionGroupSetDimension[];
    code: Id;
    colSubTotals: boolean;
    colTotals: boolean;
    columnDimensions: string[];
    columns: unknown[];
    completedOnly: boolean;
    created: string;
    createdBy: User;
    cumulative: boolean;
    dataDimensionItems: unknown[];
    dataElementDimensions: TrackedEntityDataElementDimension[];
    dataElementGroupSetDimensions: DataElementGroupSetDimension[];
    description: string;
    digitGroupSeparator: "COMMA" | "SPACE" | "NONE";
    displayDensity: "COMFORTABLE" | "NORMAL" | "COMPACT" | "NONE";
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    displaySubtitle: string;
    displayTitle: string;
    endDate: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filterDimensions: string[];
    filters: unknown[];
    fontSize: "LARGE" | "NORMAL" | "SMALL";
    formName: string;
    hideEmptyColumns: boolean;
    hideEmptyRows: boolean;
    hideSubtitle: boolean;
    hideTitle: boolean;
    href: string;
    id: Id;
    interpretations: Interpretation[];
    itemOrganisationUnitGroups: OrganisationUnitGroup[];
    lastUpdated: string;
    lastUpdatedBy: User;
    legendDisplayStrategy: "FIXED" | "BY_DATA_ITEM";
    legendDisplayStyle: "FILL" | "TEXT";
    legendSet: LegendSet;
    measureCriteria: string;
    name: string;
    numberType: "VALUE" | "ROW_PERCENTAGE" | "COLUMN_PERCENTAGE";
    orgUnitField: string;
    organisationUnitGroupSetDimensions: OrganisationUnitGroupSetDimension[];
    organisationUnitLevels: number[];
    organisationUnits: OrganisationUnit[];
    parentGraphMap: Map;
    periods: Ref[];
    programIndicatorDimensions: TrackedEntityProgramIndicatorDimension[];
    publicAccess: string;
    regression: boolean;
    relativePeriods: unknown;
    reportParams: unknown;
    rowDimensions: string[];
    rowSubTotals: boolean;
    rowTotals: boolean;
    rows: unknown[];
    sharing: Sharing;
    shortName: string;
    showDimensionLabels: boolean;
    showHierarchy: boolean;
    skipRounding: boolean;
    sortOrder: number;
    startDate: string;
    subscribed: boolean;
    subscribers: string[];
    subtitle: string;
    timeField: string;
    title: string;
    topLimit: number;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    userOrgUnitType: "DATA_CAPTURE" | "DATA_OUTPUT" | "TEI_SEARCH";
    userOrganisationUnit: boolean;
    userOrganisationUnitChildren: boolean;
    userOrganisationUnitGrandChildren: boolean;
};

export type ReportingRate = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    dataSet: DataSet;
    description: string;
    dimensionItem: string;
    dimensionItemType:
        | "DATA_ELEMENT"
        | "DATA_ELEMENT_OPERAND"
        | "INDICATOR"
        | "REPORTING_RATE"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION"
        | "OPTION_GROUP"
        | "DATA_ELEMENT_GROUP"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY_OPTION_GROUP";
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    legendSet: LegendSet;
    legendSets: LegendSet[];
    metric:
        | "REPORTING_RATE"
        | "REPORTING_RATE_ON_TIME"
        | "ACTUAL_REPORTS"
        | "ACTUAL_REPORTS_ON_TIME"
        | "EXPECTED_REPORTS";
    name: string;
    periodOffset: number;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type SMSCommand = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    codeValueSeparator: string;
    completenessMethod: "ALL_DATAVALUE" | "AT_LEAST_ONE_DATAVALUE" | "DO_NOT_MARK_COMPLETE";
    created: string;
    createdBy: User;
    currentPeriodUsedForReporting: boolean;
    dataset: DataSet;
    defaultMessage: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    moreThanOneOrgUnitMessage: string;
    name: string;
    noUserMessage: string;
    parserType:
        | "KEY_VALUE_PARSER"
        | "J2ME_PARSER"
        | "ALERT_PARSER"
        | "UNREGISTERED_PARSER"
        | "TRACKED_ENTITY_REGISTRATION_PARSER"
        | "PROGRAM_STAGE_DATAENTRY_PARSER"
        | "EVENT_REGISTRATION_PARSER";
    program: Program;
    programStage: ProgramStage;
    publicAccess: string;
    receivedMessage: string;
    separator: string;
    sharing: Sharing;
    smsCodes: unknown[];
    specialCharacters: unknown[];
    successMessage: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroup: UserGroup;
    userGroupAccesses: UserGroupAccess[];
    wrongFormatMessage: string;
};

export type Section = {
    access: Access;
    attributeValues: AttributeValue[];
    categoryCombos: CategoryCombo[];
    code: Id;
    created: string;
    createdBy: User;
    dataElements: DataElement[];
    dataSet: DataSet;
    description: string;
    disableDataElementAutoGroup: boolean;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    greyedFields: DataElementOperand[];
    href: string;
    id: Id;
    indicators: Indicator[];
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    publicAccess: string;
    sharing: Sharing;
    showColumnTotals: boolean;
    showRowTotals: boolean;
    sortOrder: number;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type SqlView = {
    access: AccessWithData;
    attributeValues: AttributeValue[];
    cacheStrategy:
        | "NO_CACHE"
        | "CACHE_1_MINUTE"
        | "CACHE_5_MINUTES"
        | "CACHE_10_MINUTES"
        | "CACHE_15_MINUTES"
        | "CACHE_30_MINUTES"
        | "CACHE_1_HOUR"
        | "CACHE_6AM_TOMORROW"
        | "CACHE_TWO_WEEKS"
        | "RESPECT_SYSTEM_SETTING";
    code: Id;
    created: string;
    createdBy: User;
    description: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    publicAccess: string;
    sharing: Sharing;
    sqlQuery: string;
    translations: Translation[];
    type: "VIEW" | "MATERIALIZED_VIEW" | "QUERY";
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type TrackedEntityAttribute = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeValues: AttributeValue[];
    code: Id;
    confidential: boolean;
    created: string;
    createdBy: User;
    description: string;
    dimensionItem: string;
    dimensionItemType:
        | "DATA_ELEMENT"
        | "DATA_ELEMENT_OPERAND"
        | "INDICATOR"
        | "REPORTING_RATE"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION"
        | "OPTION_GROUP"
        | "DATA_ELEMENT_GROUP"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY_OPTION_GROUP";
    displayDescription: string;
    displayFormName: string;
    displayInListNoProgram: boolean;
    displayName: string;
    displayOnVisitSchedule: boolean;
    displayShortName: string;
    expression: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    fieldMask: string;
    formName: string;
    generated: boolean;
    href: string;
    id: Id;
    inherit: boolean;
    lastUpdated: string;
    lastUpdatedBy: User;
    legendSet: LegendSet;
    legendSets: LegendSet[];
    name: string;
    optionSet: OptionSet;
    optionSetValue: boolean;
    orgunitScope: boolean;
    pattern: string;
    periodOffset: number;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    skipSynchronization: boolean;
    sortOrderInListNoProgram: number;
    sortOrderInVisitSchedule: number;
    style: Style;
    translations: Translation[];
    unique: boolean;
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    valueType:
        | "TEXT"
        | "LONG_TEXT"
        | "LETTER"
        | "PHONE_NUMBER"
        | "EMAIL"
        | "BOOLEAN"
        | "TRUE_ONLY"
        | "DATE"
        | "DATETIME"
        | "TIME"
        | "NUMBER"
        | "UNIT_INTERVAL"
        | "PERCENTAGE"
        | "INTEGER"
        | "INTEGER_POSITIVE"
        | "INTEGER_NEGATIVE"
        | "INTEGER_ZERO_OR_POSITIVE"
        | "TRACKER_ASSOCIATE"
        | "USERNAME"
        | "COORDINATE"
        | "ORGANISATION_UNIT"
        | "AGE"
        | "URL"
        | "FILE_RESOURCE"
        | "IMAGE";
};

export type TrackedEntityAttributeValue = {
    created: string;
    lastUpdated: string;
    storedBy: string;
    trackedEntityAttribute: TrackedEntityAttribute;
    trackedEntityInstance: TrackedEntityInstance;
    value: string;
};

export type TrackedEntityDataElementDimension = {
    dataElement: DataElement;
    filter: string;
    legendSet: LegendSet;
    programStage: ProgramStage;
};

export type TrackedEntityInstance = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdAtClient: string;
    createdBy: User;
    deleted: boolean;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    geometry: Geometry;
    href: string;
    id: Id;
    inactive: boolean;
    lastUpdated: string;
    lastUpdatedAtClient: string;
    lastUpdatedBy: User;
    name: string;
    organisationUnit: OrganisationUnit;
    programInstances: ProgramInstance[];
    programOwners: ProgramOwner[];
    publicAccess: string;
    relationshipItems: unknown[];
    sharing: Sharing;
    storedBy: string;
    trackedEntityAttributeValues: TrackedEntityAttributeValue[];
    trackedEntityType: TrackedEntityType;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type TrackedEntityInstanceFilter = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    description: string;
    displayDescription: string;
    displayName: string;
    enrollmentCreatedPeriod: unknown;
    enrollmentStatus: "ACTIVE" | "COMPLETED" | "CANCELLED";
    eventFilters: unknown[];
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    followup: boolean;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    program: Program;
    publicAccess: string;
    sharing: Sharing;
    sortOrder: number;
    style: Style;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type TrackedEntityProgramIndicatorDimension = {
    filter: string;
    legendSet: LegendSet;
    programIndicator: ProgramIndicator;
};

export type TrackedEntityType = {
    access: AccessWithData;
    allowAuditLog: boolean;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    description: string;
    displayDescription: string;
    displayFormName: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    featureType: "NONE" | "MULTI_POLYGON" | "POLYGON" | "POINT" | "SYMBOL";
    formName: string;
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    maxTeiCountToReturn: number;
    minAttributesRequiredToSearch: number;
    name: string;
    publicAccess: string;
    sharing: Sharing;
    shortName: string;
    style: Style;
    trackedEntityTypeAttributes: TrackedEntityTypeAttribute[];
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type TrackedEntityTypeAttribute = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    displayInList: boolean;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    mandatory: boolean;
    name: string;
    publicAccess: string;
    searchable: boolean;
    sharing: Sharing;
    trackedEntityAttribute: TrackedEntityAttribute;
    trackedEntityType: TrackedEntityType;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    valueType:
        | "TEXT"
        | "LONG_TEXT"
        | "LETTER"
        | "PHONE_NUMBER"
        | "EMAIL"
        | "BOOLEAN"
        | "TRUE_ONLY"
        | "DATE"
        | "DATETIME"
        | "TIME"
        | "NUMBER"
        | "UNIT_INTERVAL"
        | "PERCENTAGE"
        | "INTEGER"
        | "INTEGER_POSITIVE"
        | "INTEGER_NEGATIVE"
        | "INTEGER_ZERO_OR_POSITIVE"
        | "TRACKER_ASSOCIATE"
        | "USERNAME"
        | "COORDINATE"
        | "ORGANISATION_UNIT"
        | "AGE"
        | "URL"
        | "FILE_RESOURCE"
        | "IMAGE";
};

export type User = {
    access: Access;
    attributeValues: AttributeValue[];
    avatar: FileResource;
    birthday: string;
    code: Id;
    created: string;
    createdBy: User;
    dataViewOrganisationUnits: OrganisationUnit[];
    displayName: string;
    education: string;
    email: string;
    employer: string;
    externalAccess: boolean;
    facebookMessenger: string;
    favorite: boolean;
    favorites: string[];
    firstName: string;
    gender: string;
    href: string;
    id: Id;
    interests: string;
    introduction: string;
    jobTitle: string;
    languages: string;
    lastCheckedInterpretations: string;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    nationality: string;
    organisationUnits: OrganisationUnit[];
    phoneNumber: string;
    publicAccess: string;
    sharing: Sharing;
    skype: string;
    surname: string;
    teiSearchOrganisationUnits: OrganisationUnit[];
    telegram: string;
    translations: Translation[];
    twitter: string;
    user: User;
    userAccesses: UserAccess[];
    userCredentials: UserCredentials;
    userGroupAccesses: UserGroupAccess[];
    userGroups: UserGroup[];
    welcomeMessage: string;
    whatsApp: string;
};

export type UserAccess = {
    access: string;
    displayName: string;
    id: string;
    userUid: string;
};

export type UserAuthorityGroup = {
    access: Access;
    attributeValues: AttributeValue[];
    authorities: string[];
    code: Id;
    created: string;
    createdBy: User;
    description: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    publicAccess: string;
    sharing: Sharing;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    users: User[];
};

export type UserCredentials = {
    access: Access;
    accountExpiry: string;
    attributeValues: AttributeValue[];
    catDimensionConstraints: Category[];
    code: Id;
    cogsDimensionConstraints: CategoryOptionGroupSet[];
    created: string;
    createdBy: User;
    disabled: boolean;
    displayName: string;
    externalAccess: boolean;
    externalAuth: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    invitation: boolean;
    lastLogin: string;
    lastUpdated: string;
    lastUpdatedBy: User;
    ldapId: string;
    name: string;
    openId: string;
    password: string;
    passwordLastUpdated: string;
    publicAccess: string;
    selfRegistered: boolean;
    sharing: Sharing;
    translations: Translation[];
    twoFA: boolean;
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    userInfo: User;
    userRoles: UserAuthorityGroup[];
    username: string;
};

export type UserGroup = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    managedByGroups: UserGroup[];
    managedGroups: UserGroup[];
    name: string;
    publicAccess: string;
    sharing: Sharing;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    users: User[];
};

export type UserGroupAccess = {
    access: string;
    displayName: string;
    id: string;
    userGroupUid: string;
};

export type ValidationNotificationTemplate = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    displayMessageTemplate: string;
    displayName: string;
    displaySubjectTemplate: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    messageTemplate: string;
    name: string;
    notifyParentOrganisationUnitOnly: boolean;
    notifyUsersInHierarchyOnly: boolean;
    publicAccess: string;
    recipientUserGroups: UserGroup[];
    sendStrategy: "COLLECTIVE_SUMMARY" | "SINGLE_NOTIFICATION";
    sharing: Sharing;
    subjectTemplate: string;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    validationRules: ValidationRule[];
};

export type ValidationResult = {
    attributeOptionCombo: CategoryOptionCombo;
    created: string;
    dayInPeriod: number;
    id: string;
    leftsideValue: number;
    notificationSent: boolean;
    organisationUnit: OrganisationUnit;
    period: Ref;
    rightsideValue: number;
    validationRule: ValidationRule;
};

export type ValidationRule = {
    access: Access;
    aggregateExportAttributeOptionCombo: string;
    aggregateExportCategoryOptionCombo: string;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    description: string;
    dimensionItem: string;
    dimensionItemType:
        | "DATA_ELEMENT"
        | "DATA_ELEMENT_OPERAND"
        | "INDICATOR"
        | "REPORTING_RATE"
        | "PROGRAM_DATA_ELEMENT"
        | "PROGRAM_ATTRIBUTE"
        | "PROGRAM_INDICATOR"
        | "PERIOD"
        | "ORGANISATION_UNIT"
        | "CATEGORY_OPTION"
        | "OPTION_GROUP"
        | "DATA_ELEMENT_GROUP"
        | "ORGANISATION_UNIT_GROUP"
        | "CATEGORY_OPTION_GROUP";
    displayDescription: string;
    displayFormName: string;
    displayInstruction: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    href: string;
    id: Id;
    importance: "HIGH" | "MEDIUM" | "LOW";
    instruction: string;
    lastUpdated: string;
    lastUpdatedBy: User;
    leftSide: Expression;
    legendSet: LegendSet;
    legendSets: LegendSet[];
    name: string;
    notificationTemplates: ValidationNotificationTemplate[];
    operator:
        | "equal_to"
        | "not_equal_to"
        | "greater_than"
        | "greater_than_or_equal_to"
        | "less_than"
        | "less_than_or_equal_to"
        | "compulsory_pair"
        | "exclusive_pair";
    organisationUnitLevels: number[];
    periodOffset: number;
    periodType: string;
    publicAccess: string;
    rightSide: Expression;
    sharing: Sharing;
    shortName: string;
    skipFormValidation: boolean;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    validationRuleGroups: ValidationRuleGroup[];
};

export type ValidationRuleGroup = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    createdBy: User;
    description: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: User;
    name: string;
    publicAccess: string;
    sharing: Sharing;
    translations: Translation[];
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    validationRules: ValidationRule[];
};

export type Visualization = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "LAST_IN_PERIOD"
        | "LAST_IN_PERIOD_AVERAGE_ORG_UNIT"
        | "FIRST"
        | "FIRST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeDimensions: unknown[];
    attributeValues: AttributeValue[];
    axes: unknown[];
    baseLineLabel: string;
    baseLineValue: number;
    categoryDimensions: CategoryDimension[];
    categoryOptionGroupSetDimensions: CategoryOptionGroupSetDimension[];
    code: Id;
    colSubTotals: boolean;
    colTotals: boolean;
    colorSet: string;
    columnDimensions: string[];
    columns: unknown[];
    completedOnly: boolean;
    created: string;
    createdBy: User;
    cumulativeValues: boolean;
    dataDimensionItems: unknown[];
    dataElementDimensions: TrackedEntityDataElementDimension[];
    dataElementGroupSetDimensions: DataElementGroupSetDimension[];
    description: string;
    digitGroupSeparator: "COMMA" | "SPACE" | "NONE";
    displayBaseLineLabel: string;
    displayDensity: "COMFORTABLE" | "NORMAL" | "COMPACT" | "NONE";
    displayDescription: string;
    displayDomainAxisLabel: string;
    displayFormName: string;
    displayName: string;
    displayRangeAxisLabel: string;
    displayShortName: string;
    displaySubtitle: string;
    displayTargetLineLabel: string;
    displayTitle: string;
    domainAxisLabel: string;
    endDate: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filterDimensions: string[];
    filters: unknown[];
    fontSize: "LARGE" | "NORMAL" | "SMALL";
    fontStyle: unknown;
    formName: string;
    hideEmptyColumns: boolean;
    hideEmptyRowItems: "NONE" | "BEFORE_FIRST" | "AFTER_LAST" | "BEFORE_FIRST_AFTER_LAST" | "ALL";
    hideEmptyRows: boolean;
    hideLegend: boolean;
    hideSubtitle: boolean;
    hideTitle: boolean;
    href: string;
    id: Id;
    interpretations: Interpretation[];
    itemOrganisationUnitGroups: OrganisationUnitGroup[];
    lastUpdated: string;
    lastUpdatedBy: User;
    legend: unknown;
    legendDisplayStrategy: "FIXED" | "BY_DATA_ITEM";
    legendDisplayStyle: "FILL" | "TEXT";
    legendSet: LegendSet;
    measureCriteria: string;
    name: string;
    noSpaceBetweenColumns: boolean;
    numberType: "VALUE" | "ROW_PERCENTAGE" | "COLUMN_PERCENTAGE";
    optionalAxes: Axis[];
    orgUnitField: string;
    organisationUnitGroupSetDimensions: OrganisationUnitGroupSetDimension[];
    organisationUnitLevels: number[];
    organisationUnits: OrganisationUnit[];
    outlierAnalysis: unknown;
    parentGraphMap: Map;
    percentStackedValues: boolean;
    periods: Ref[];
    programIndicatorDimensions: TrackedEntityProgramIndicatorDimension[];
    publicAccess: string;
    rangeAxisDecimals: number;
    rangeAxisLabel: string;
    rangeAxisMaxValue: number;
    rangeAxisMinValue: number;
    rangeAxisSteps: number;
    regression: boolean;
    regressionType: "NONE" | "LINEAR" | "POLYNOMIAL" | "LOESS";
    relativePeriods: unknown;
    reportingParams: ReportingParams;
    rowDimensions: string[];
    rowSubTotals: boolean;
    rowTotals: boolean;
    rows: unknown[];
    series: unknown[];
    sharing: Sharing;
    shortName: string;
    showData: boolean;
    showDimensionLabels: boolean;
    showHierarchy: boolean;
    skipRounding: boolean;
    sortOrder: number;
    startDate: string;
    subscribed: boolean;
    subscribers: string[];
    subtitle: string;
    targetLineLabel: string;
    targetLineValue: number;
    timeField: string;
    title: string;
    topLimit: number;
    translations: Translation[];
    type:
        | "COLUMN"
        | "STACKED_COLUMN"
        | "BAR"
        | "STACKED_BAR"
        | "LINE"
        | "AREA"
        | "STACKED_AREA"
        | "PIE"
        | "RADAR"
        | "GAUGE"
        | "YEAR_OVER_YEAR_LINE"
        | "YEAR_OVER_YEAR_COLUMN"
        | "SINGLE_VALUE"
        | "PIVOT_TABLE"
        | "SCATTER"
        | "BUBBLE";
    user: User;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    userOrgUnitType: "DATA_CAPTURE" | "DATA_OUTPUT" | "TEI_SEARCH";
    userOrganisationUnit: boolean;
    userOrganisationUnitChildren: boolean;
    userOrganisationUnitGrandChildren: boolean;
    visualizationPeriodName: string;
    yearlySeries: string[];
};

export type DataStore = {
    externalAccess: boolean;
    id: Id;
    code: string;
    name: string;
    displayName: string;
    favorites: string[];
    translations: Translation[];
    keys: DataStoreKey[];
};

export type DataStoreKey = { id: Id; displayName: string };

export type MetadataEntity =
    | UserAuthorityGroup
    | Attribute
    | User
    | UserGroup
    | Option
    | OptionSet
    | OptionGroupSet
    | OptionGroup
    | LegendSet
    | OrganisationUnit
    | OrganisationUnitLevel
    | OrganisationUnitGroup
    | OrganisationUnitGroupSet
    | CategoryOption
    | CategoryOptionGroup
    | CategoryOptionGroupSet
    | Category
    | CategoryCombo
    | CategoryOptionCombo
    | DataElement
    | DataElementGroup
    | DataElementGroupSet
    | IndicatorType
    | Indicator
    | IndicatorGroup
    | IndicatorGroupSet
    | DataEntryForm
    | DataSet
    | DataSetNotificationTemplate
    | Section
    | DataApprovalLevel
    | DataApprovalWorkflow
    | DataStore
    | ValidationRule
    | ValidationRuleGroup
    | ValidationNotificationTemplate
    | TrackedEntityAttribute
    | RelationshipType
    | TrackedEntityType
    | ProgramTrackedEntityAttributeGroup
    | ProgramStageSection
    | ProgramNotificationTemplate
    | ProgramStage
    | Program
    | EventChart
    | EventReport
    | ProgramSection
    | ProgramIndicator
    | ProgramRuleVariable
    | ProgramIndicatorGroup
    | ProgramRuleAction
    | ProgramRule
    | MapView
    | Report
    | ReportTable
    | Map
    | Chart
    | Document
    | Dashboard
    | MessageConversation
    | SqlView
    | Visualization;

//TODO: Add as value entoty definitions
// currently this concept are models with include/exclude rules, collectionName...
export type MetadataEntities = {
    attributes: Attribute[];
    categories: Category[];
    categoryCombos: CategoryCombo[];
    categoryOptions: CategoryOption[];
    categoryOptionCombos: CategoryOptionCombo[];
    categoryOptionGroups: CategoryOptionGroup[];
    categoryOptionGroupSets: CategoryOptionGroupSet[];
    constants: Constant[];
    charts: Chart[];
    dashboards: Dashboard[];
    dataApprovalLevels: DataApprovalLevel[];
    dataApprovalWorkflows: DataApprovalWorkflow[];
    dataElements: DataElement[];
    dataElementGroups: DataElementGroup[];
    dataElementGroupSets: DataElementGroupSet[];
    dataEntryForms: DataEntryForm[];
    dataSets: DataSet[];
    dataSetNotificationTemplates: DataSetNotificationTemplate[];
    dataStores: DataStore[];
    documents: Document[];
    eventCharts: EventChart[];
    eventReports: EventReport[];
    indicatorTypes: IndicatorType[];
    indicators: Indicator[];
    indicatorGroups: IndicatorGroup[];
    indicatorGroupSets: IndicatorGroupSet[];
    legendSets: LegendSet[];
    maps: Map[];
    mapViews: MapView[];
    messageConversations: MessageConversation[];
    options: Option[];
    optionSets: OptionSet[];
    optionGroupSets: OptionGroupSet[];
    optionGroups: OptionGroup[];
    organisationUnits: Ref[];
    organisationUnitLevels: OrganisationUnitLevel[];
    organisationUnitGroups: OrganisationUnitGroup[];
    organisationUnitGroupSets: OrganisationUnitGroupSet[];
    programTrackedEntityAttributeGroups: ProgramTrackedEntityAttributeGroup[];
    programStageSections: ProgramStageSection[];
    programNotificationTemplates: ProgramNotificationTemplate[];
    programStages: ProgramStage[];
    programs: Program[];
    programSections: ProgramSection[];
    programIndicators: ProgramIndicator[];
    programRuleVariables: ProgramRuleVariable[];
    programIndicatorGroups: ProgramIndicatorGroup[];
    programRuleActions: ProgramRuleAction[];
    programRules: ProgramRule[];
    relationshipTypes: RelationshipType[];
    reports: Report[];
    reportTables: ReportTable[];
    sections: Section[];
    sqlViews: SqlView[];
    trackedEntityAttributes: TrackedEntityAttribute[];
    trackedEntityTypes: TrackedEntityType[];
    users: Ref[];
    userGroups: UserGroup[];
    userRoles: UserAuthorityGroup[];
    validationRules: ValidationRule[];
    validationRuleGroups: ValidationRuleGroup[];
    validationNotificationTemplates: ValidationNotificationTemplate[];
    visualizations: Visualization[];
};

export type MetadataPackage<T = MetadataEntity> = Partial<Record<keyof MetadataEntities, T[]>>;

// function getApiModel(api: D2Api, type: keyof MetadataEntities): InstanceType<typeof Model> {
//     return api.models[type];
// }
