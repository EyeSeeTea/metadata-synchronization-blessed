import { Ref } from "../../common/entities/Ref";
import { Access, Expression, Id, Style, Translation } from "../../common/entities/Schemas";

export type AttributeValue = {
    attribute: Ref;
    created: string;
    lastUpdated: string;
    value: string;
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
    dataElementAttribute: boolean;
    dataElementGroupAttribute: boolean;
    dataElementGroupSetAttribute: boolean;
    dataSetAttribute: boolean;
    description: string;
    displayDescription: string;
    displayName: string;
    displayShortName: string;
    documentAttribute: boolean;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    indicatorAttribute: boolean;
    indicatorGroupAttribute: boolean;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendSetAttribute: boolean;
    mandatory: boolean;
    name: string;
    optionAttribute: boolean;
    optionSet: Ref;
    optionSetAttribute: boolean;
    organisationUnitAttribute: boolean;
    organisationUnitGroupAttribute: boolean;
    organisationUnitGroupSetAttribute: boolean;
    programAttribute: boolean;
    programIndicatorAttribute: boolean;
    programStageAttribute: boolean;
    publicAccess: string;
    sectionAttribute: boolean;
    shortName: string;
    sortOrder: number;
    sqlViewAttribute: boolean;
    trackedEntityAttributeAttribute: boolean;
    trackedEntityTypeAttribute: boolean;
    translations: Translation[];
    unique: boolean;
    user: Ref;
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

export type UserRole = {
    access: Access;
    attributeValues: AttributeValue[];
    authorities: string[];
    code: Id;
    created: string;
    description: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    publicAccess: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    users: Ref[];
};

export type User = {
    access: Access;
    attributeValues: AttributeValue[];
    birthday: string;
    code: Id;
    created: string;
    dataViewOrganisationUnits: Ref[];
    displayName: string;
    education: string;
    email: string;
    employer: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    firstName: string;
    gender: string;
    id: Id;
    interests: string;
    introduction: string;
    jobTitle: string;
    languages: string;
    lastCheckedInterpretations: string;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    nationality: string;
    organisationUnits: Ref[];
    phoneNumber: string;
    publicAccess: string;
    surname: string;
    teiSearchOrganisationUnits: Ref[];
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userCredentials: UserCredentials;
    userGroupAccesses: UserGroupAccess[];
    userGroups: Ref[];
    welcomeMessage: string;
};

export type UserGroup = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    managedByGroups: Ref[];
    managedGroups: Ref[];
    name: string;
    publicAccess: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    users: Ref[];
};

export type Option = {
    access: Access;
    attributeValues: AttributeValue[];
    code: string;
    created: string;
    description: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    optionSet: Ref;
    publicAccess: string;
    sortOrder: number;
    style: Style;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type OptionSet = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    options: Ref[];
    publicAccess: string;
    translations: Translation[];
    user: Ref;
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

export type OptionGroup = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
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
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendSets: Ref[];
    name: string;
    optionSet: Ref;
    options: Ref[];
    publicAccess: string;
    shortName: string;
    translations: Translation[];
    user: Ref;
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
    dataDimension: boolean;
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
    displayDescription: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filter: string;
    id: Id;
    items: any[];
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendSet: Ref;
    name: string;
    optionGroups: Ref[];
    optionSet: Ref;
    publicAccess: string;
    shortName: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type LegendSet = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legends: Legend[];
    name: string;
    publicAccess: string;
    symbolizer: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ColorSet = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    colors: Color[];
    created: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    publicAccess: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
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
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    ancestors: Ref[];
    attributeValues: AttributeValue[];
    children: Ref[];
    closedDate: string;
    code: Id;
    comment: string;
    contactPerson: string;
    coordinates: string;
    created: string;
    dataSets: Ref[];
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
    displayName: string;
    displayShortName: string;
    email: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    featureType: "NONE" | "MULTI_POLYGON" | "POLYGON" | "POINT" | "SYMBOL";
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    leaf: boolean;
    legendSet: Ref;
    legendSets: Ref[];
    level: number;
    memberCount: number;
    name: string;
    openingDate: string;
    organisationUnitGroups: Ref[];
    parent: Ref;
    path: string;
    phoneNumber: string;
    programs: Program[];
    publicAccess: string;
    shortName: string;
    translations: Translation[];
    type: string;
    url: string;
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    users: Ref[];
};

export type OrganisationUnitLevel = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    level: number;
    name: string;
    offlineLevels: number;
    publicAccess: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type OrganisationUnitGroup = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
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
    coordinates: string;
    created: string;
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
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    featureType: "NONE" | "MULTI_POLYGON" | "POLYGON" | "POINT" | "SYMBOL";
    groupSets: Ref[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendSet: Ref;
    legendSets: Ref[];
    name: string;
    organisationUnits: Ref[];
    publicAccess: string;
    shortName: string;
    symbol: string;
    translations: Translation[];
    user: Ref;
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
    dataDimension: boolean;
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
    displayDescription: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filter: string;
    id: Id;
    includeSubhierarchyInAnalytics: boolean;
    items: any[];
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendSet: Ref;
    name: string;
    organisationUnitGroups: Ref[];
    publicAccess: string;
    shortName: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type CategoryOption = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeValues: AttributeValue[];
    categories: Ref[];
    categoryOptionCombos: Ref[];
    categoryOptionGroups: Ref[];
    code: Id;
    created: string;
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
    displayName: string;
    displayShortName: string;
    endDate: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    isDefault: boolean;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendSet: Ref;
    legendSets: Ref[];
    name: string;
    organisationUnits: Ref[];
    publicAccess: string;
    shortName: string;
    startDate: string;
    style: Style;
    translations: Translation[];
    user: Ref;
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
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeValues: AttributeValue[];
    categoryOptions: Ref[];
    code: Id;
    created: string;
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
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    groupSets: Ref[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendSet: Ref;
    legendSets: Ref[];
    name: string;
    publicAccess: string;
    shortName: string;
    translations: Translation[];
    user: Ref;
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
    categoryOptionGroups: Ref[];
    code: Id;
    created: string;
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
    displayDescription: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filter: string;
    id: Id;
    items: Ref[];
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendSet: Ref;
    name: string;
    publicAccess: string;
    shortName: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type Category = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
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
    categoryCombos: Ref[];
    categoryOptions: Ref[];
    code: Id;
    created: string;
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
    displayDescription: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filter: string;
    id: Id;
    items: Ref[];
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendSet: Ref;
    name: string;
    publicAccess: string;
    shortName: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type CategoryCombo = {
    access: Access;
    attributeValues: AttributeValue[];
    categories: Ref[];
    categoryOptionCombos: Ref[];
    code: Id;
    created: string;
    dataDimensionType: "DISAGGREGATION" | "ATTRIBUTE";
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    isDefault: boolean;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    publicAccess: string;
    skipTotal: boolean;
    translations: Translation[];
    user: Ref;
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
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    ignoreApproval: boolean;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendSet: Ref;
    legendSets: Ref[];
    name: string;
    publicAccess: string;
    shortName: string;
    translations: Translation[];
    user: Ref;
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
    code: Id;
    commentOptionSet: Ref;
    created: string;
    dataElementGroups: Ref[];
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
    formName: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendSet: Ref;
    legendSets: Ref[];
    name: string;
    optionSet: Ref;
    optionSetValue: boolean;
    publicAccess: string;
    shortName: string;
    style: Style;
    translations: Translation[];
    url: string;
    user: Ref;
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
    dataElements: Ref[];
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
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    groupSets: Ref[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendSet: Ref;
    legendSets: Ref[];
    name: string;
    publicAccess: string;
    shortName: string;
    translations: Translation[];
    user: Ref;
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
    dataDimension: boolean;
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
    displayDescription: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filter: string;
    id: Id;
    items: any[];
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendSet: Ref;
    name: string;
    publicAccess: string;
    shortName: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type IndicatorType = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    displayName: string;
    externalAccess: boolean;
    factor: number;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    number: boolean;
    publicAccess: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

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
    dataSets: Ref[];
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
    displayDescription: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    id: Id;
    indicatorGroups: Ref[];
    indicatorType: Ref;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendSet: Ref;
    legendSets: Ref[];
    name: string;
    numerator: string;
    numeratorDescription: string;
    publicAccess: string;
    shortName: string;
    style: Style;
    translations: Translation[];
    url: string;
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type IndicatorGroup = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    indicatorGroupSet: Ref;
    indicators: Ref[];
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    publicAccess: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type IndicatorGroupSet = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    compulsory: boolean;
    created: string;
    description: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    indicatorGroups: Ref[];
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    publicAccess: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type DataEntryForm = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    format: number;
    htmlCode: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    publicAccess: string;
    style: "COMFORTABLE" | "NORMAL" | "COMPACT" | "NONE";
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type DataSet = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
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
    code: Id;
    compulsoryDataElementOperands: DataElementOperand[];
    compulsoryFieldsCompleteOnly: boolean;
    created: string;
    dataElementDecoration: boolean;
    dataEntryForm: Ref;
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
    displayName: string;
    displayShortName: string;
    expiryDays: number;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    fieldCombinationRequired: boolean;
    formName: string;
    formType: "DEFAULT" | "CUSTOM" | "SECTION" | "SECTION_MULTIORG";
    id: Id;
    indicators: Ref[];
    interpretations: Ref[];
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendSet: Ref;
    legendSets: Ref[];
    mobile: boolean;
    name: string;
    noValueRequiresComment: boolean;
    notificationRecipients: UserGroup;
    notifyCompletingUser: boolean;
    openFuturePeriods: number;
    organisationUnits: Ref[];
    periodType: string;
    publicAccess: string;
    renderAsTabs: boolean;
    renderHorizontally: boolean;
    sections: Section[];
    shortName: string;
    skipOffline: boolean;
    style: Style;
    timelyDays: number;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    validCompleteOnly: boolean;
    version: number;
    workflow: Ref;
};

export type DataSetNotificationTemplate = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    dataSetNotificationTrigger: "DATA_SET_COMPLETION" | "SCHEDULED_DAYS";
    dataSets: DataSet[];
    deliveryChannels: never[];
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    messageTemplate: string;
    name: string;
    notificationRecipient: "ORGANISATION_UNIT_CONTACT" | "USER_GROUP";
    notifyParentOrganisationUnitOnly: boolean;
    notifyUsersInHierarchyOnly: boolean;
    publicAccess: string;
    recipientUserGroup: UserGroup;
    relativeScheduledDays: number;
    sendStrategy: "COLLECTIVE_SUMMARY" | "SINGLE_NOTIFICATION";
    subjectTemplate: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type Section = {
    access: Access;
    attributeValues: AttributeValue[];
    categoryCombos: Ref[];
    code: Id;
    created: string;
    dataElements: Ref[];
    dataSet: Ref;
    description: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    greyedFields: DataElementOperand[];
    id: Id;
    indicators: Ref[];
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    publicAccess: string;
    showColumnTotals: boolean;
    showRowTotals: boolean;
    sortOrder: number;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type DataApprovalLevel = {
    access: Access;
    attributeValues: AttributeValue[];
    categoryOptionGroupSet: Ref;
    code: Id;
    created: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    level: number;
    name: string;
    orgUnitLevel: number;
    orgUnitLevelName: string;
    publicAccess: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type DataApprovalWorkflow = {
    access: Access;
    attributeValues: AttributeValue[];
    categoryCombo: CategoryCombo;
    code: Id;
    created: string;
    dataApprovalLevels: DataApprovalLevel[];
    dataSets: DataSet[];
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    periodType: string;
    publicAccess: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
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
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    importance: "HIGH" | "MEDIUM" | "LOW";
    instruction: string;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    leftSide: Expression;
    legendSet: Ref;
    legendSets: Ref[];
    name: string;
    notificationTemplates: Ref[];
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
    periodType: string;
    publicAccess: string;
    rightSide: Expression;
    shortName: string;
    skipFormValidation: boolean;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    validationRuleGroups: Ref[];
};

export type ValidationRuleGroup = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    description: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    publicAccess: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    validationRules: Ref[];
};

export type ValidationNotificationTemplate = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    messageTemplate: string;
    name: string;
    notifyParentOrganisationUnitOnly: boolean;
    notifyUsersInHierarchyOnly: boolean;
    publicAccess: string;
    recipientUserGroups: UserGroup[];
    sendStrategy: "COLLECTIVE_SUMMARY" | "SINGLE_NOTIFICATION";
    subjectTemplate: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    validationRules: ValidationRule[];
};

export type TrackedEntityAttribute = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
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
    displayInListNoProgram: boolean;
    displayName: string;
    displayOnVisitSchedule: boolean;
    displayShortName: string;
    expression: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    generated: boolean;
    id: Id;
    inherit: boolean;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendSet: Ref;
    legendSets: Ref[];
    name: string;
    optionSet: Ref;
    optionSetValue: boolean;
    orgunitScope: boolean;
    pattern: string;
    programScope: boolean;
    publicAccess: string;
    shortName: string;
    skipSynchronization: boolean;
    sortOrderInListNoProgram: number;
    sortOrderInVisitSchedule: number;
    style: Style;
    translations: Translation[];
    unique: boolean;
    user: Ref;
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

export type RelationshipType = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    description: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    fromConstraint: any;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    publicAccess: string;
    toConstraint: any;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type TrackedEntityType = {
    access: Access;
    allowAuditLog: boolean;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    description: string;
    displayDescription: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    maxTeiCountToReturn: number;
    minAttributesRequiredToSearch: number;
    name: string;
    publicAccess: string;
    shortName: string;
    style: Style;
    trackedEntityTypeAttributes: TrackedEntityTypeAttribute[];
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type TrackedEntityTypeAttribute = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    displayInList: boolean;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    mandatory: boolean;
    name: string;
    publicAccess: string;
    searchable: boolean;
    trackedEntityAttribute: Ref;
    trackedEntityType: Ref;
    translations: Translation[];
    user: Ref;
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

export type ProgramTrackedEntityAttributeGroup = {
    access: Access;
    attributeValues: AttributeValue[];
    attributes: ProgramTrackedEntityAttribute[];
    code: Id;
    created: string;
    description: string;
    displayDescription: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    publicAccess: string;
    shortName: string;
    translations: Translation[];
    uniqunessType: "NONE" | "STRICT" | "VALIDATION";
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramNotificationTemplate = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    deliveryChannels: never[];
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
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
    subjectTemplate: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramStageSection = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    dataElements: Ref[];
    description: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    programIndicators: Ref[];
    programStage: Ref;
    publicAccess: string;
    renderType: any;
    sortOrder: number;
    style: Style;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramStage = {
    access: Access;
    allowGenerateNextVisit: boolean;
    attributeValues: AttributeValue[];
    autoGenerateEvent: boolean;
    blockEntryForm: boolean;
    code: Id;
    created: string;
    dataEntryForm: Ref;
    description: string;
    displayDescription: string;
    displayGenerateEventBox: boolean;
    displayName: string;
    dueDateLabel: string;
    executionDateLabel: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    featureType: "NONE" | "MULTI_POLYGON" | "POLYGON" | "POINT" | "SYMBOL";
    formName: string;
    formType: "DEFAULT" | "CUSTOM" | "SECTION" | "SECTION_MULTIORG";
    generatedByEnrollmentDate: boolean;
    hideDueDate: boolean;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    minDaysFromStart: number;
    name: string;
    notificationTemplates: Ref[];
    openAfterEnrollment: boolean;
    periodType: string;
    preGenerateUID: boolean;
    program: Ref;
    programStageDataElements: ProgramStageDataElement[];
    programStageSections: Ref[];
    publicAccess: string;
    remindCompleted: boolean;
    repeatable: boolean;
    reportDateToUse: string;
    sortOrder: number;
    standardInterval: number;
    style: Style;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    validCompleteOnly: boolean;
};

export type Program = {
    access: Access;
    accessLevel: "OPEN" | "AUDITED" | "PROTECTED" | "CLOSED";
    attributeValues: AttributeValue[];
    captureCoordinates: boolean;
    categoryCombo: Ref;
    code: Id;
    completeEventsExpiryDays: number;
    created: string;
    dataEntryForm: Ref;
    description: string;
    displayDescription: string;
    displayFrontPageList: boolean;
    displayIncidentDate: boolean;
    displayName: string;
    displayShortName: string;
    enrollmentDateLabel: string;
    expiryDays: number;
    expiryPeriodType: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    id: Id;
    ignoreOverdueEvents: boolean;
    incidentDateLabel: string;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    maxTeiCountToReturn: number;
    minAttributesRequiredToSearch: number;
    name: string;
    notificationTemplates: Ref[];
    onlyEnrollOnce: boolean;
    organisationUnits: Ref[];
    programIndicators: Ref[];
    programRuleVariables: Ref[];
    programSections: Ref[];
    programStages: Ref[];
    programTrackedEntityAttributes: ProgramTrackedEntityAttribute[];
    programType: "WITH_REGISTRATION" | "WITHOUT_REGISTRATION";
    publicAccess: string;
    registration: boolean;
    relatedProgram: Program;
    selectEnrollmentDatesInFuture: boolean;
    selectIncidentDatesInFuture: boolean;
    shortName: string;
    skipOffline: boolean;
    style: Style;
    trackedEntityType: Ref;
    translations: Translation[];
    useFirstStageDuringRegistration: boolean;
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    userRoles: Ref[];
    version: number;
    withoutRegistration: boolean;
    workflow: Ref;
    programRules?: Ref[];
};

export type EventChart = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeDimensions: any[];
    attributeValueDimension: any;
    attributeValues: AttributeValue[];
    baseLineLabel: string;
    baseLineValue: number;
    categoryDimensions: CategoryDimension[];
    categoryOptionGroupSetDimensions: CategoryOptionGroupSetDimension[];
    code: Id;
    collapseDataDimensions: boolean;
    colorSet: ColorSet;
    columnDimensions: string[];
    columns: any[];
    completedOnly: boolean;
    created: string;
    cumulativeValues: boolean;
    dataDimensionItems: any[];
    dataElementDimensions: TrackedEntityDataElementDimension[];
    dataElementGroupSetDimensions: DataElementGroupSetDimension[];
    dataElementValueDimension: DataElement;
    description: string;
    digitGroupSeparator: "COMMA" | "SPACE" | "NONE";
    displayDescription: string;
    displayName: string;
    displayShortName: string;
    domainAxisLabel: string;
    endDate: string;
    eventStatus: "ACTIVE" | "COMPLETED" | "VISITED" | "SCHEDULE" | "OVERDUE" | "SKIPPED";
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filterDimensions: string[];
    filters: any[];
    hideEmptyRowItems: "NONE" | "BEFORE_FIRST" | "AFTER_LAST" | "BEFORE_FIRST_AFTER_LAST" | "ALL";
    hideLegend: boolean;
    hideNaData: boolean;
    hideSubtitle: boolean;
    hideTitle: boolean;
    id: Id;
    interpretations: Ref[];
    itemOrganisationUnitGroups: Ref[];
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendDisplayStrategy: "FIXED" | "BY_DATA_ITEM";
    legendSet: Ref;
    name: string;
    noSpaceBetweenColumns: boolean;
    organisationUnitGroupSetDimensions: OrganisationUnitGroupSetDimension[];
    organisationUnitLevels: number[];
    organisationUnits: Ref[];
    outputType: "EVENT" | "ENROLLMENT" | "TRACKED_ENTITY_INSTANCE";
    parentGraphMap: Map;
    percentStackedValues: boolean;
    periods: any[];
    program: Ref;
    programIndicatorDimensions: TrackedEntityProgramIndicatorDimension[];
    programStage: Ref;
    programStatus: "ACTIVE" | "COMPLETED" | "CANCELLED";
    publicAccess: string;
    rangeAxisDecimals: number;
    rangeAxisLabel: string;
    rangeAxisMaxValue: number;
    rangeAxisMinValue: number;
    rangeAxisSteps: number;
    regressionType: "NONE" | "LINEAR" | "POLYNOMIAL" | "LOESS";
    relativePeriods: any;
    rowDimensions: string[];
    rows: any[];
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
    type: "COLUMN" | "STACKED_COLUMN" | "BAR" | "STACKED_BAR" | "LINE" | "AREA" | "PIE" | "RADAR" | "GAUGE";
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    userOrganisationUnit: boolean;
    userOrganisationUnitChildren: boolean;
    userOrganisationUnitGrandChildren: boolean;
    value: any;
};

export type EventReport = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeDimensions: any[];
    attributeValueDimension: any;
    attributeValues: AttributeValue[];
    categoryDimensions: CategoryDimension[];
    categoryOptionGroupSetDimensions: CategoryOptionGroupSetDimension[];
    code: Id;
    colSubTotals: boolean;
    colTotals: boolean;
    collapseDataDimensions: boolean;
    columnDimensions: string[];
    columns: any[];
    completedOnly: boolean;
    created: string;
    dataDimensionItems: any[];
    dataElementDimensions: TrackedEntityDataElementDimension[];
    dataElementGroupSetDimensions: DataElementGroupSetDimension[];
    dataElementValueDimension: DataElement;
    dataType: "AGGREGATED_VALUES" | "EVENTS";
    description: string;
    digitGroupSeparator: "COMMA" | "SPACE" | "NONE";
    displayDensity: "COMFORTABLE" | "NORMAL" | "COMPACT" | "NONE";
    displayDescription: string;
    displayName: string;
    displayShortName: string;
    endDate: string;
    eventStatus: "ACTIVE" | "COMPLETED" | "VISITED" | "SCHEDULE" | "OVERDUE" | "SKIPPED";
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filterDimensions: string[];
    filters: any[];
    fontSize: "LARGE" | "NORMAL" | "SMALL";
    hideEmptyRows: boolean;
    hideNaData: boolean;
    hideSubtitle: boolean;
    hideTitle: boolean;
    id: Id;
    interpretations: Ref[];
    itemOrganisationUnitGroups: Ref[];
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    organisationUnitGroupSetDimensions: OrganisationUnitGroupSetDimension[];
    organisationUnitLevels: number[];
    organisationUnits: Ref[];
    outputType: "EVENT" | "ENROLLMENT" | "TRACKED_ENTITY_INSTANCE";
    parentGraphMap: Map;
    periods: any[];
    program: Ref;
    programIndicatorDimensions: TrackedEntityProgramIndicatorDimension[];
    programStage: Ref;
    programStatus: "ACTIVE" | "COMPLETED" | "CANCELLED";
    publicAccess: string;
    relativePeriods: any;
    rowDimensions: string[];
    rowSubTotals: boolean;
    rowTotals: boolean;
    rows: any[];
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
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    userOrganisationUnit: boolean;
    userOrganisationUnitChildren: boolean;
    userOrganisationUnitGrandChildren: boolean;
    value: any;
};

export type ProgramSection = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    description: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    formName: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    program: Program;
    programTrackedEntityAttribute: TrackedEntityAttribute[];
    publicAccess: string;
    renderType: any;
    sortOrder: number;
    style: Style;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
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
    displayInForm: boolean;
    displayName: string;
    displayShortName: string;
    expression: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filter: string;
    formName: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendSet: Ref;
    legendSets: Ref[];
    name: string;
    program: Ref;
    programIndicatorGroups: Ref[];
    publicAccess: string;
    shortName: string;
    style: Style;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramRuleVariable = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    dataElement: Ref;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    program: Ref;
    programRuleVariableSourceType:
        | "DATAELEMENT_NEWEST_EVENT_PROGRAM_STAGE"
        | "DATAELEMENT_NEWEST_EVENT_PROGRAM"
        | "DATAELEMENT_CURRENT_EVENT"
        | "DATAELEMENT_PREVIOUS_EVENT"
        | "CALCULATED_VALUE"
        | "TEI_ATTRIBUTE";
    programStage: Ref;
    publicAccess: string;
    trackedEntityAttribute: TrackedEntityAttribute;
    translations: Translation[];
    useCodeForOptionSet: boolean;
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramIndicatorGroup = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    description: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    programIndicators: Ref[];
    publicAccess: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramRuleAction = {
    access: Access;
    attributeValues: AttributeValue[];
    created: string;
    dataElement: Ref;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    name: never;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    programRule: Ref;
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
    translations: Translation[];
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramRule = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    condition: string;
    created: string;
    description: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    priority: number;
    program: Ref;
    programRuleActions: Ref[];
    programStage: Ref;
    publicAccess: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type MapView = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    areaRadius: number;
    attributeDimensions: any[];
    attributeValues: AttributeValue[];
    categoryDimensions: CategoryDimension[];
    categoryOptionGroupSetDimensions: CategoryOptionGroupSetDimension[];
    classes: number;
    code: Id;
    colorHigh: string;
    colorLow: string;
    colorScale: string;
    columnDimensions: string[];
    columns: any[];
    completedOnly: boolean;
    config: string;
    created: string;
    dataDimensionItems: any[];
    dataElementDimensions: TrackedEntityDataElementDimension[];
    dataElementGroupSetDimensions: DataElementGroupSetDimension[];
    description: string;
    digitGroupSeparator: "COMMA" | "SPACE" | "NONE";
    displayDescription: string;
    displayName: string;
    displayShortName: string;
    endDate: string;
    eventClustering: boolean;
    eventCoordinateField: string;
    eventPointColor: string;
    eventPointRadius: number;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filters: any[];
    followUp: boolean;
    hidden: boolean;
    hideSubtitle: boolean;
    hideTitle: boolean;
    id: Id;
    interpretations: Ref[];
    itemOrganisationUnitGroups: Ref[];
    labelFontColor: string;
    labelFontSize: string;
    labelFontStyle: string;
    labelFontWeight: string;
    labels: boolean;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    layer: string;
    legendSet: Ref;
    method: number;
    name: string;
    opacity: number;
    organisationUnitGroupSet: Ref;
    organisationUnitGroupSetDimensions: OrganisationUnitGroupSetDimension[];
    organisationUnitLevels: number[];
    organisationUnitSelectionMode: "SELECTED" | "CHILDREN" | "DESCENDANTS" | "ACCESSIBLE" | "CAPTURE" | "ALL";
    organisationUnits: Ref[];
    parentGraph: string;
    parentGraphMap: Map;
    parentLevel: number;
    periods: any[];
    program: Ref;
    programIndicatorDimensions: TrackedEntityProgramIndicatorDimension[];
    programStage: Ref;
    programStatus: "ACTIVE" | "COMPLETED" | "CANCELLED";
    publicAccess: string;
    radiusHigh: number;
    radiusLow: number;
    relativePeriods: any;
    rows: any[];
    shortName: string;
    sortOrder: number;
    startDate: string;
    styleDataItem: object;
    subscribed: boolean;
    subscribers: string[];
    subtitle: string;
    timeField: string;
    title: string;
    topLimit: number;
    trackedEntityType: Ref;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    userOrganisationUnit: boolean;
    userOrganisationUnitChildren: boolean;
    userOrganisationUnitGrandChildren: boolean;
};

export type Chart = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeDimensions: any[];
    attributeValues: AttributeValue[];
    baseLineLabel: string;
    baseLineValue: number;
    category: string;
    categoryDimensions: CategoryDimension[];
    categoryOptionGroupSetDimensions: CategoryOptionGroupSetDimension[];
    code: Id;
    colorSet: Ref;
    columns: any[];
    completedOnly: boolean;
    created: string;
    cumulativeValues: boolean;
    dataDimensionItems: any[];
    dataElementDimensions: TrackedEntityDataElementDimension[];
    dataElementGroupSetDimensions: DataElementGroupSetDimension[];
    description: string;
    digitGroupSeparator: "COMMA" | "SPACE" | "NONE";
    displayDescription: string;
    displayName: string;
    displayShortName: string;
    domainAxisLabel: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filterDimensions: string[];
    filters: any[];
    hideEmptyRowItems: "NONE" | "BEFORE_FIRST" | "AFTER_LAST" | "BEFORE_FIRST_AFTER_LAST" | "ALL";
    hideLegend: boolean;
    hideSubtitle: boolean;
    hideTitle: boolean;
    id: Id;
    interpretations: Ref[];
    itemOrganisationUnitGroups: Ref[];
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendDisplayStrategy: "FIXED" | "BY_DATA_ITEM";
    legendSet: Ref;
    name: string;
    noSpaceBetweenColumns: boolean;
    organisationUnitGroupSetDimensions: OrganisationUnitGroupSetDimension[];
    organisationUnitLevels: number[];
    organisationUnits: Ref[];
    parentGraphMap: Map;
    percentStackedValues: boolean;
    periods: any[];
    programIndicatorDimensions: TrackedEntityProgramIndicatorDimension[];
    publicAccess: string;
    rangeAxisDecimals: number;
    rangeAxisLabel: string;
    rangeAxisMaxValue: number;
    rangeAxisMinValue: number;
    rangeAxisSteps: number;
    regressionType: "NONE" | "LINEAR" | "POLYNOMIAL" | "LOESS";
    relativePeriods: any;
    rows: any[];
    series: string;
    shortName: string;
    showData: boolean;
    sortOrder: number;
    subscribed: boolean;
    subscribers: string[];
    subtitle: string;
    targetLineLabel: string;
    targetLineValue: number;
    timeField: string;
    title: string;
    topLimit: number;
    translations: Translation[];
    type: "COLUMN" | "STACKED_COLUMN" | "BAR" | "STACKED_BAR" | "LINE" | "AREA" | "PIE" | "RADAR" | "GAUGE";
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    userOrganisationUnit: boolean;
    userOrganisationUnitChildren: boolean;
    userOrganisationUnitGrandChildren: boolean;
};

export type Document = {
    access: Access;
    attachment: boolean;
    attributeValues: AttributeValue[];
    code: Id;
    contentType: string;
    created: string;
    displayName: string;
    external: boolean;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    publicAccess: string;
    translations: Translation[];
    url: string;
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type Report = {
    access: Access;
    attributeValues: AttributeValue[];
    cacheStrategy:
        | "NO_CACHE"
        | "CACHE_15_MINUTES"
        | "CACHE_30_MINUTES"
        | "CACHE_1_HOUR"
        | "CACHE_6AM_TOMORROW"
        | "CACHE_TWO_WEEKS"
        | "RESPECT_SYSTEM_SETTING";
    code: Id;
    created: string;
    designContent: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    publicAccess: string;
    relativePeriods: any;
    reportParams: any;
    reportTable: any;
    translations: Translation[];
    type: "JASPER_REPORT_TABLE" | "JASPER_JDBC" | "HTML";
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ReportTable = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeDimensions: any[];
    attributeValues: AttributeValue[];
    categoryDimensions: CategoryDimension[];
    categoryOptionGroupSetDimensions: CategoryOptionGroupSetDimension[];
    code: Id;
    colSubTotals: boolean;
    colTotals: boolean;
    columnDimensions: string[];
    columns: any[];
    completedOnly: boolean;
    created: string;
    cumulative: boolean;
    dataDimensionItems: any[];
    dataElementDimensions: TrackedEntityDataElementDimension[];
    dataElementGroupSetDimensions: DataElementGroupSetDimension[];
    description: string;
    digitGroupSeparator: "COMMA" | "SPACE" | "NONE";
    displayDensity: "COMFORTABLE" | "NORMAL" | "COMPACT" | "NONE";
    displayDescription: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    filterDimensions: string[];
    filters: any[];
    fontSize: "LARGE" | "NORMAL" | "SMALL";
    hideEmptyColumns: boolean;
    hideEmptyRows: boolean;
    hideSubtitle: boolean;
    hideTitle: boolean;
    id: Id;
    interpretations: Interpretation[];
    itemOrganisationUnitGroups: Ref[];
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendDisplayStrategy: "FIXED" | "BY_DATA_ITEM";
    legendDisplayStyle: "FILL" | "TEXT";
    legendSet: Ref;
    measureCriteria: string;
    name: string;
    numberType: "VALUE" | "ROW_PERCENTAGE" | "COLUMN_PERCENTAGE";
    organisationUnitGroupSetDimensions: OrganisationUnitGroupSetDimension[];
    organisationUnitLevels: number[];
    organisationUnits: Ref[];
    parentGraphMap: Map;
    periods: any[];
    programIndicatorDimensions: TrackedEntityProgramIndicatorDimension[];
    publicAccess: string;
    regression: boolean;
    relativePeriods: any;
    reportParams: any;
    rowDimensions: string[];
    rowSubTotals: boolean;
    rowTotals: boolean;
    rows: any[];
    shortName: string;
    showDimensionLabels: boolean;
    showHierarchy: boolean;
    skipRounding: boolean;
    sortOrder: number;
    subscribed: boolean;
    subscribers: string[];
    subtitle: string;
    timeField: string;
    title: string;
    topLimit: number;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    userOrganisationUnit: boolean;
    userOrganisationUnitChildren: boolean;
    userOrganisationUnitGrandChildren: boolean;
};

export type Map = {
    access: Access;
    attributeValues: AttributeValue[];
    basemap: string;
    code: Id;
    created: string;
    description: string;
    displayDescription: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    interpretations: Ref[];
    lastUpdated: string;
    lastUpdatedBy: Ref;
    latitude: number;
    longitude: number;
    mapViews: Ref[];
    name: string;
    publicAccess: string;
    shortName: string;
    subscribed: boolean;
    subscribers: string[];
    title: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    zoom: number;
};

export type DashboardItem = {
    access: Access;
    appKey: string;
    attributeValues: AttributeValue[];
    chart: Ref;
    code: Id;
    contentCount: number;
    created: string;
    displayName: string;
    eventChart: Ref;
    eventReport: Ref;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    height: number;
    id: Id;
    interpretationCount: number;
    interpretationLikeCount: number;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    map: Map;
    messages: boolean;
    name: string;
    publicAccess: string;
    reportTable: Ref;
    reports: Ref[];
    resources: Ref[];
    shape: "NORMAL" | "DOUBLE_WIDTH" | "FULL_WIDTH";
    text: string;
    translations: Translation[];
    type:
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
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    users: Ref[];
    width: number;
    x: number;
    y: number;
};

export type Dashboard = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    dashboardItems: DashboardItem[];
    description: string;
    displayDescription: string;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    itemCount: number;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    publicAccess: string;
    shortName: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type OrganisationUnitGroupSetDimension = {
    organisationUnitGroupSet: Ref;
    organisationUnitGroups: Ref[];
};

export type DataElementOperand = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
        | "COUNT"
        | "STDDEV"
        | "VARIANCE"
        | "MIN"
        | "MAX"
        | "NONE"
        | "CUSTOM"
        | "DEFAULT";
    attributeOptionCombo: Ref;
    attributeValues: AttributeValue[];
    categoryOptionCombo: Ref;
    code: Id;
    created: string;
    dataElement: Ref;
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
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendSet: Ref;
    legendSets: Ref[];
    name: string;
    publicAccess: string;
    shortName: string;
    translations: Translation[];
    user: Ref;
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
    dataSet: DataSet;
    displayName: string;
    eventChart: EventChart;
    eventReport: EventReport;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    likedBy: User[];
    likes: number;
    map: Map;
    mentions: any[];
    name: string;
    organisationUnit: Ref;
    period: any;
    publicAccess: string;
    reportTable: ReportTable;
    text: string;
    translations: Translation[];
    type: "REPORT_TABLE" | "CHART" | "MAP" | "EVENT_REPORT" | "EVENT_CHART" | "DATASET_REPORT";
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type CategoryOptionGroupSetDimension = {
    categoryOptionGroupSet: Ref;
    categoryOptionGroups: Ref[];
};

export type TrackedEntityProgramIndicatorDimension = {
    filter: string;
    legendSet: Ref;
    programIndicator: Ref;
};

export type Legend = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    color: string;
    created: string;
    displayName: string;
    endValue: number;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    image: string;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    publicAccess: string;
    startValue: number;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type InterpretationComment = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    mentions: any[];
    name: string;
    publicAccess: string;
    text: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

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
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    offsetPeriodType: string;
    offsetPeriods: number;
    publicAccess: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type ProgramDataElementDimensionItem = {
    access: Access;
    aggregationType:
        | "SUM"
        | "AVERAGE"
        | "AVERAGE_SUM_ORG_UNIT"
        | "LAST"
        | "LAST_AVERAGE_ORG_UNIT"
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
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    legendSet: Ref;
    legendSets: Ref[];
    name: string;
    program: Program;
    publicAccess: string;
    shortName: string;
    translations: Translation[];
    user: Ref;
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

export type UserGroupAccess = {
    access: string;
    displayName: string;
    id: string;
    userGroupUid: string;
};

export type DataElementGroupSetDimension = {
    dataElementGroupSet: Ref;
    dataElementGroups: Ref[];
};

export type CategoryDimension = {
    category: Ref;
    categoryOptions: Ref[];
};

export type TrackedEntityDataElementDimension = {
    dataElement: Ref;
    filter: string;
    legendSet: Ref;
};

export type ProgramStageDataElement = {
    access: Access;
    allowFutureDate: boolean;
    allowProvidedElsewhere: boolean;
    attributeValues: AttributeValue[];
    code: Id;
    compulsory: boolean;
    created: string;
    dataElement: Ref;
    displayInReports: boolean;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    programStage: Ref;
    publicAccess: string;
    renderOptionsAsRadio: boolean;
    renderType: any;
    skipSynchronization: boolean;
    sortOrder: number;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type UserCredentials = {
    access: Access;
    attributeValues: AttributeValue[];
    catDimensionConstraints: Ref[];
    code: Id;
    cogsDimensionConstraints: Ref[];
    created: string;
    disabled: boolean;
    displayName: string;
    externalAccess: boolean;
    externalAuth: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    invitation: boolean;
    lastLogin: string;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    ldapId: string;
    name: string;
    openId: string;
    password: string;
    passwordLastUpdated: string;
    publicAccess: string;
    selfRegistered: boolean;
    translations: Translation[];
    twoFA: boolean;
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
    userInfo: User;
    userRoles: Ref[];
    username: string;
};

export type MessageConversation = {
    access: Access;
    assignee: Ref;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    followUp: boolean;
    id: Id;
    lastMessage: string;
    lastSender: User;
    lastSenderFirstname: string;
    lastSenderSurname: string;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    messageCount: number;
    messageType: "PRIVATE" | "SYSTEM" | "VALIDATION_RESULT" | "TICKET";
    messages: any[];
    name: string;
    priority: "NONE" | "LOW" | "MEDIUM" | "HIGH";
    publicAccess: string;
    read: boolean;
    status: "NONE" | "OPEN" | "PENDING" | "INVALID" | "SOLVED";
    subject: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userFirstname: string;
    userGroupAccesses: UserGroupAccess[];
    userMessages: any[];
    userSurname: string;
};

export type Color = {
    access: Access;
    attributeValues: AttributeValue[];
    code: Id;
    color: string;
    created: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    publicAccess: string;
    translations: Translation[];
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type DataInputPeriod = {
    closingDate: string;
    openingDate: string;
    period: any;
};

export type ProgramTrackedEntityAttribute = {
    access: Access;
    allowFutureDate: boolean;
    attributeValues: AttributeValue[];
    code: Id;
    created: string;
    displayInList: boolean;
    displayName: string;
    displayShortName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    mandatory: boolean;
    name: string;
    program: Ref;
    programTrackedEntityAttributeGroups: ProgramTrackedEntityAttributeGroup[];
    publicAccess: string;
    renderOptionsAsRadio: boolean;
    renderType: any;
    searchable: boolean;
    sortOrder: number;
    trackedEntityAttribute: Ref;
    translations: Translation[];
    user: Ref;
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

export type DataSetElement = {
    categoryCombo: Ref;
    dataElement: Ref;
    dataSet: Ref;
};

export type UserAccess = {
    access: string;
    displayName: string;
    id: string;
    userUid: string;
};

export type SqlView = {
    access: Access;
    attributeValues: AttributeValue[];
    cacheStrategy:
        | "NO_CACHE"
        | "CACHE_15_MINUTES"
        | "CACHE_30_MINUTES"
        | "CACHE_1_HOUR"
        | "CACHE_6AM_TOMORROW"
        | "CACHE_TWO_WEEKS"
        | "RESPECT_SYSTEM_SETTING";
    code: Id;
    created: string;
    description: string;
    displayName: string;
    externalAccess: boolean;
    favorite: boolean;
    favorites: string[];
    href: string;
    id: Id;
    lastUpdated: string;
    lastUpdatedBy: Ref;
    name: string;
    publicAccess: string;
    sqlQuery: string;
    translations: Translation[];
    type: "VIEW" | "MATERIALIZED_VIEW" | "QUERY";
    user: Ref;
    userAccesses: UserAccess[];
    userGroupAccesses: UserGroupAccess[];
};

export type MetadataEntity =
    | UserRole
    | Attribute
    | User
    | UserGroup
    | Option
    | OptionSet
    | OptionGroupSet
    | OptionGroup
    | LegendSet
    | ColorSet
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
    | SqlView;

export type MetadataKey = "userRoles" | "attributes" | "";

//TODO: Add as value entoty definitions
// currently this concept are models with include/exclude rules, collectionName...
export type MetadataEntities = {
    userRoles: UserRole[];
    attributes: Attribute[];
    users: Ref[];
    userGroups: UserGroup[];
    options: Ref[];
    optionSets: OptionSet[];
    optionGroupSets: OptionGroupSet[];
    optionGroups: OptionGroup[];
    legendSets: LegendSet[];
    colorSets: ColorSet[];
    organisationUnits: Ref[];
    organisationUnitLevels: OrganisationUnitLevel[];
    organisationUnitGroups: OrganisationUnitGroup[];
    organisationUnitGroupSets: OrganisationUnitGroupSet[];
    categoryOptions: CategoryOption[];
    categoryOptionGroups: CategoryOptionGroup[];
    categoryOptionGroupSets: CategoryOptionGroupSet[];
    categories: Category[];
    categoryCombos: CategoryCombo[];
    categoryOptionCombos: CategoryOptionCombo[];
    dataElements: DataElement[];
    dataElementGroups: DataElementGroup[];
    dataElementGroupSets: DataElementGroupSet[];
    indicatorTypes: IndicatorType[];
    indicators: Indicator[];
    indicatorGroups: IndicatorGroup[];
    indicatorGroupSets: IndicatorGroupSet[];
    dataEntryForms: DataEntryForm[];
    dataSets: DataSet[];
    dataSetNotificationTemplates: DataSetNotificationTemplate[];
    sections: Section[];
    dataApprovalLevels: DataApprovalLevel[];
    dataApprovalWorkflows: DataApprovalWorkflow[];
    validationRules: ValidationRule[];
    validationRuleGroups: ValidationRuleGroup[];
    validationNotificationTemplates: ValidationNotificationTemplate[];
    trackedEntityAttributes: TrackedEntityAttribute[];
    relationshipTypes: RelationshipType[];
    trackedEntityTypes: TrackedEntityType[];
    programTrackedEntityAttributeGroups: ProgramTrackedEntityAttributeGroup[];
    programStageSections: ProgramStageSection[];
    programNotificationTemplates: ProgramNotificationTemplate[];
    programStages: ProgramStage[];
    programs: Program[];
    eventCharts: EventChart[];
    eventReports: EventReport[];
    programSections: ProgramSection[];
    programIndicators: ProgramIndicator[];
    programRuleVariables: ProgramRuleVariable[];
    programIndicatorGroups: ProgramIndicatorGroup[];
    programRuleActions: ProgramRuleAction[];
    programRules: ProgramRule[];
    mapViews: MapView[];
    reports: Report[];
    reportTables: ReportTable[];
    maps: Map[];
    charts: Chart[];
    documents: Document[];
    dashboards: Dashboard[];
    messageConversations: MessageConversation[];
    sqlViews: SqlView[];
};

export type MetadataPackage<T = MetadataEntity> = Partial<Record<keyof MetadataEntities, T[]>>;
