const includeExcludeRulesFriendlyNames: {
    [metadataType: string]: string;
} = {
    attributes: "Attributes",
    dataSets: "Data sets",
    categoryCombos: "Category combinations",
    "categoryCombos.attributes": "Attributes of category combinations",
    "categoryCombos.categoryOptionCombos": "Category option combinations of Category combinations",
    "categoryCombos.categoryOptionCombos.categoryOptions":
        "Category options of Category option combinations in Category combinations",
    "categoryCombos.categories": "Categories of category combinations",
    dataElements: "Data elements",
    "dataElements.attributes": "Attributes of data elements",
    "dataElements.dataElementGroups": "Data element groups of dataElements",
    dataElementGroups: "Data element groups",
    "dataElementGroups.attributes": "Attributes of Data element groups",
    "dataElementGroups.dataElements": "Data elements of data element groups",
    "dataElementGroups.dataElements.attributes":
        "Attributes of data elements in data element groups",
    "dataElementGroups.dataElements.dataElementGroups":
        "Data element groups of data elements in data element groups",
    "dataElementGroups.dataElementGroupSets": "Data element group sets of data element groups",
    "dataElementGroups.dataElementGroupSets.attributes":
        "Attributes of data element group sets in data element groups",
    "dataElementGroups.dataElementGroupSets.dataElementGroups":
        "Data element groups of dataelement group sets in data element groups",
    dataElementGroupSets: "Data element group sets",
    "dataElementGroupSets.attributes": "Attributes of data element group sets",
    indicators: "Indicators",
    "indicators.attributes": "Attributes of indicators",
    "indicators.indicatorGroups": "Indicator groups of indicators",
    indicatorGroups: "Indicator groups",
    "indicatorGroups.attributes": "Attributes of indicator groups",
    "indicatorGroups.indicators": "Indicators of indicator groups",
    "indicatorGroups.indicators.attributes": "Attributes of indicators in indicator groups",
    "indicatorGroups.indicators.indicatorGroups":
        "Indicator groups of indicators in indicator groups",
    "indicatorGroups.indicatorGroupSet": "Indicator group sets of indicator groups",
    "indicatorGroups.indicatorGroupSets": "Indicator group sets of indicator groups",
    indicatorGroupSets: "Indicator group sets",
    "indicatorGroupSets.attributes": "Attributes of indicator group sets",
    indicatorType: "Indicator type",
    legendSets: "Legend sets",
    programs: "Programs",
    optionSets: "Option sets",
    "optionSets.options": "Options in option sets",
    organisationUnits: "Organisation units",
    "organisationUnits.attributes": "Attributes of organisation units",
    "organisationUnits.organisationUnitGroups": "Organisation unit groups of organisation units",
    organisationUnitGroups: "Organisation unit groups",
    "organisationUnitGroups.attributes": "Attributes of organisation unit groups",
    "organisationUnitGroups.organisationUnits": "Organisation units in organisation unit groups",
    "organisationUnitGroups.organisationUnits.attributes":
        "Attributes of organisation units in organisation unit groups",
    "organisationUnitGroups.organisationUnits.organisationUnitGroups":
        "Organisation unit groups of organisation units in organisation unit groups",
    "organisationUnitGroups.organisationUnitGroupSets":
        "Organisation unit group sets of organisation unit groups",
    "organisationUnitGroups.organisationUnitGroupSets.attributes":
        "Attributes of organisation unit group sets in organisation unit groups",
    organisationUnitGroupSets: "Organisation unit group sets",
    "organisationUnitGroupSets.attributes": "Attributes of organisation unit group sets",
    users: "Users",
    validationRules: "Validation rules",
    "validationRules.attributes": "Attributes of validation rules",
    "validationRules.validationRuleGroups": "Validation rule groups of validation rules",
    validationRuleGroups: "Validation rule groups",
    "validationRuleGroups.attributes": "Attributes of validation rule groups",
    dashboardItems: "Dashboard items",
    charts: "Charts",
    eventCharts: "Event charts",
    pivotTables: "Pivot tables",
    eventReports: "Event reports",
    maps: "Maps",
    reports: "Reports",
    reportTables: "Report Tables",
    "indicators.dataSets": "Data sets of indicators",
    "indicators.programs": "Programs of indicators",
    "dataElements.dataSets": "Data sets of data elements",
    "dataElements.dataElementGroups.dataElements":
        "Data elements of data element groups in data elements",
    "dataElements.dataElementGroups.dataElementGroupSets.dataElementGroups":
        "Data element groups in data element group sets of data element groups of data elements",
    "indicators.legendSets": "Legends of indicators",
    "indicators.indicatorTypes": "Indicator types of indicators",
    "indicators.indicatorGroups.attributes": "Attributes of indicator groups in indicators",
    "indicators.indicatorGroups.indicatorGroupSet":
        "Indicator group set of indicator groups in indicators",
    "dataElements.legendSets": "Legends of data elements",
    "dataElements.optionSets": "Option sets of data elements",
    "dataElements.optionSets.options": "Options of option sets in data elements",
    "dataElements.categoryCombos": "Category combinations of data elements",
    "dataElements.categoryCombos.attributes":
        "Attributes of category combinations in data elements",
    "dataElements.categoryCombos.categoryOptionCombos":
        "Category option combinations of Category combinations in data elements",
    "dataElements.categoryCombos.categoryOptionCombos.categoryOptions":
        "Category options of Category option combinations in Category combinations in data elements",
    "dataElements.categoryCombos.categories":
        "Categories of category combinations in data elements",
    "dataElements.dataElementGroups.attributes":
        "Attributes of data element groups in data elements",
    "dataElements.dataElementGroups.dataElementGroupSets":
        "Data element group sets of data element groups in data elements",
    "dataElements.dataElementGroups.dataElementGroupSets.attributes":
        "Attributes of Data element group sets of data element groups in data elements",
    "programStages.dataElements.dataElementGroups.dataElements":
        "Data elements of data element groups of data elements in program stages",
    "programStages.dataElements.dataElementGroups.dataElementGroupSets.dataElementGroups":
        "Data element groups of data element group sets of data element groups of data elements in program Stages",
    programIndicators: "Program indicators",
    "programIndicators.programIndicatorGroups": "Program indicator groups of program indicators",
    "programIndicators.legendSets": "Legends of program indicators",
    dataApprovalWorkflow: "Data approval workflow",
    "dataApprovalWorkflow.dataApprovalLevels": "Data approval levels in data approval workflow",
    programStages: "Program stages",
    "programStages.programStageSections": "Program stage sections in program stages",
    "programStages.attributes": "Attributes of program stages",
    "programStages.dataElements": "Data elements in program stages",
    "programStages.dataElements.attributes": "Attributes of data elements in program stages",
    "programStages.dataElements.legendSets": "Legends of data elements in program stages",
    "programStages.dataElements.optionSets": "Option sets of data elements in program stages",
    "programStages.dataElements.optionSets.options":
        "Options in option sets of data elements in program stages",
    "programStages.dataElements.categoryCombos":
        "Category combinations of data elements in program stages",
    "programStages.dataElements.categoryCombos.attributes":
        "Attributes of category combinations of data elements in program stages",
    "programStages.dataElements.categoryCombos.categoryOptionCombos":
        "Category option combinations of Category combinations of data elements in program stages",
    "programStages.dataElements.categoryCombos.categoryOptionCombos.categoryOptions":
        "Category options of Category option combinations of Category combinations of data elements in program stages",
    "programStages.dataElements.categoryCombos.categories":
        "Categories of category combinations of data elements in program stages",
    "programStages.dataElements.dataElementGroups":
        "Data element groups of data elements in program stages",
    "programStages.dataElements.dataElementGroups.attributes":
        "Attributes of data element groups of data elements in program stages",
    "programStages.dataElements.dataElementGroups.dataElementGroupSets":
        "Data element group sets of data element groups of data elements in program stages",
    "programStages.dataElements.dataElementGroups.dataElementGroupSets.attributes":
        "Atrributes of data element group sets of data element groups of data elements in program stages",
    "programStages.programNotificationTemplates": "Notification templates of program",
    programRuleVariables: "Program rule variables",
    trackedEntityTypes: "Tracked entity types",
    "trackedEntityTypes.trackedEntityAttributes":
        "Tracked entity attributes of tracked entity types",
    "trackedEntityTypes.trackedEntityAttributes.legendSets":
        "Legends of tracked entity attributes of tracked entity types",
    trackedEntityAttributes: "Tracked entity attributes",
    "trackedEntityAttributes.legendSets": "Legends of tracked entity attributes",
    "users.userRoles": "User roles of users",
};

export default includeExcludeRulesFriendlyNames;
