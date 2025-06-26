import { SynchronizationBuilder } from "../../../../synchronization/entities/SynchronizationBuilder";
import { SynchronizationPayload } from "../../../../synchronization/entities/SynchronizationPayload";
import { DataElement, DataElementGroup, DataSet, MetadataPackage } from "../../../entities/MetadataEntities";

export function givenABuilderWithDataSetType(options: {
    includeObjectsAndReferences: boolean;
    includeOnlyReferences: boolean;
}): SynchronizationBuilder {
    const { includeObjectsAndReferences, includeOnlyReferences } = options;

    return {
        metadataIds: ["rsyjyJmYD4J"],
        filterRules: [],
        excludedIds: [],
        metadataTypes: ["dataSets"],
        originInstance: "LOCAL",
        targetInstances: ["LOCAL"],
        syncParams: {
            enableMapping: false,
            useDefaultIncludeExclude: true,
            metadataModelsSyncAll: [],
            includeSharingSettingsObjectsAndReferences: includeObjectsAndReferences,
            includeOnlySharingSettingsReferences: includeOnlyReferences,
            includeUsersObjectsAndReferences: includeObjectsAndReferences,
            includeOnlyUsersReferences: includeOnlyReferences,
            includeOrgUnitsObjectsAndReferences: includeObjectsAndReferences,
            includeOnlyOrgUnitsReferences: includeOnlyReferences,
            importStrategy: "CREATE_AND_UPDATE",
            atomicMode: "ALL",
            mergeMode: "MERGE",
            importMode: "COMMIT",
        },
        dataParams: {
            strategy: "NEW_AND_UPDATES",
            allAttributeCategoryOptions: true,
            dryRun: false,
            allEvents: true,
            allTEIs: true,
            enableAggregation: false,
        },
    };
}

export function getDataSetMetadata(): DataSet {
    return {
        code: "EXP",
        name: "Expenditures",
        created: "2018-05-16T18:47:36.063",
        lastUpdated: "2025-03-28T06:51:44.130",
        translations: [],
        createdBy: {
            id: "GOLswS44mh8",
            code: null,
            name: "Tom Wakiki",
            displayName: "Tom Wakiki",
            username: "system",
        },
        favorites: [],
        lastUpdatedBy: {
            id: "xE7jOejl9FI",
            code: null,
            name: "John Traore",
            displayName: "John Traore",
            username: "admin",
        },
        sharing: {
            owner: "GOLswS44mh8",
            external: false,
            users: {
                rWLrZL8rP3K: {
                    displayName: "Guest User",
                    access: "rw------",
                    id: "rWLrZL8rP3K",
                },
            },
            userGroups: {
                B6JNeAQ6akX: {
                    displayName: "_DATASET_Superuser",
                    access: "rwrw----",
                    id: "B6JNeAQ6akX",
                },
            },
            public: "rw------",
        },
        shortName: "Expenditures",
        dimensionItemType: "REPORTING_RATE",
        legendSets: [],
        periodType: "FinancialApril",
        dataInputPeriods: [],
        dataSetElements: [
            {
                dataSet: {
                    id: "rsyjyJmYD4J",
                },
                dataElement: {
                    id: "BDuY694ZAFa",
                },
                categoryCombo: {},
            },
        ],
        indicators: [],
        compulsoryDataElementOperands: [],
        sections: [],
        mobile: false,
        version: 2,
        expiryDays: 0,
        timelyDays: 15,
        notifyCompletingUser: false,
        interpretations: [],
        openFuturePeriods: 2,
        openPeriodsAfterCoEndDate: 0,
        fieldCombinationRequired: false,
        validCompleteOnly: false,
        noValueRequiresComment: false,
        skipOffline: false,
        dataElementDecoration: false,
        renderAsTabs: false,
        renderHorizontally: false,
        compulsoryFieldsCompleteOnly: false,
        formType: "DEFAULT",
        displayName: "Expenditures",
        access: {
            manage: true,
            externalize: true,
            write: true,
            read: true,
            update: true,
            delete: true,
            data: {
                write: true,
                read: true,
            },
        },
        favorite: false,
        user: {
            id: "GOLswS44mh8",
            code: null,
            name: "Tom Wakiki",
            displayName: "Tom Wakiki",
            username: "system",
        },
        dimensionItem: "rsyjyJmYD4J",
        displayShortName: "Expenditures",
        displayFormName: "Expenditures",
        id: "rsyjyJmYD4J",
        attributeValues: [],
        organisationUnits: [
            {
                id: "O6uvpzGd5pu",
            },
        ],
    } as unknown as DataSet;
}

export function getDataElementDataSetMetadata(): DataElement {
    return {
        code: "EXP_CARS",
        name: "EXP Cars Expense",
        created: "2018-05-16T18:42:50.898",
        lastUpdated: "2018-05-16T18:43:32.616",
        translations: [],
        createdBy: {
            id: "GOLswS44mh8",
            code: null,
            name: "Tom Wakiki",
            displayName: "Tom Wakiki",
            username: "system",
        },
        favorites: [],
        lastUpdatedBy: {
            id: "GOLswS44mh8",
            code: null,
            name: "Tom Wakiki",
            displayName: "Tom Wakiki",
            username: "system",
        },
        sharing: {
            owner: "GOLswS44mh8",
            external: false,
            users: {},
            userGroups: {},
            public: "rw------",
        },
        shortName: "Cars Expense",
        formName: "Cars",
        dimensionItemType: "DATA_ELEMENT",
        legendSets: [],
        aggregationType: "SUM",
        valueType: "INTEGER_ZERO_OR_POSITIVE",
        domainType: "AGGREGATE",
        dataSetElements: [
            {
                dataSet: {
                    id: "rsyjyJmYD4J",
                },
                dataElement: {
                    id: "BDuY694ZAFa",
                },
                categoryCombo: {},
            },
        ],
        aggregationLevels: [],
        zeroIsSignificant: false,
        optionSetValue: false,
        dimensionItem: "BDuY694ZAFa",
        displayShortName: "Cars Expense",
        displayName: "EXP Cars Expense",
        access: {
            manage: true,
            externalize: true,
            write: true,
            read: true,
            update: true,
            delete: true,
        },
        favorite: false,
        user: {
            id: "GOLswS44mh8",
            code: null,
            name: "Tom Wakiki",
            displayName: "Tom Wakiki",
            username: "system",
        },
        displayFormName: "Cars",
        id: "BDuY694ZAFa",
        attributeValues: [],
        dataElementGroups: [
            {
                id: "GbSz3TobZcc",
            },
        ],
    } as unknown as DataElement;
}

export function getDataElementGroupMetadata(): DataElementGroup {
    return {
        name: "Expenditures",
        created: "2018-05-16T19:13:50.656",
        lastUpdated: "2018-05-16T19:13:50.656",
        translations: [],
        createdBy: {
            id: "GOLswS44mh8",
            code: null,
            name: "Tom Wakiki",
            displayName: "Tom Wakiki",
            username: "system",
        },
        favorites: [],
        lastUpdatedBy: {
            id: "GOLswS44mh8",
            code: null,
            name: "Tom Wakiki",
            displayName: "Tom Wakiki",
            username: "system",
        },
        sharing: {
            owner: "GOLswS44mh8",
            external: false,
            users: {},
            userGroups: {},
            public: "rw------",
        },
        shortName: "Expenditures",
        dimensionItemType: "DATA_ELEMENT_GROUP",
        legendSets: [],
        aggregationType: "SUM",
        groupSets: [],
        dimensionItem: "GbSz3TobZcc",
        displayShortName: "Expenditures",
        displayName: "Expenditures",
        access: {
            manage: true,
            externalize: true,
            write: true,
            read: true,
            update: true,
            delete: true,
        },
        favorite: false,
        user: {
            id: "GOLswS44mh8",
            code: null,
            name: "Tom Wakiki",
            displayName: "Tom Wakiki",
            username: "system",
        },
        displayFormName: "Expenditures",
        id: "GbSz3TobZcc",
        attributeValues: [],
        dataElements: [
            {
                id: "BDuY694ZAFa",
            },
            {
                id: "M3anTdbJ7iJ",
            },
            {
                id: "RR538iV9G1X",
            },
            {
                id: "dHrtL2a4EcD",
            },
            {
                id: "ixDKJGrGtFg",
            },
        ],
    } as unknown as DataElementGroup;
}

type ResponseNumber = "first" | "second" | "third" | "fourth" | "fifth" | "sixth" | "seventh" | "eighth";

export function getDataSetMetadataByIdsResponsesWithIncludeAll(): Record<ResponseNumber, MetadataPackage> {
    return {
        first: {
            dataSets: [getDataSetMetadata()],
        },
        second: {
            users: [
                {
                    name: "Tom Wakiki",
                    created: "2012-11-21T12:02:04.303",
                    lastUpdated: "2025-03-28T06:52:23.700",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    sharing: {
                        owner: "system-process",
                        external: false,
                        users: {},
                        userGroups: {},
                    },
                    username: "system",
                    externalAuth: false,
                    passwordLastUpdated: "2021-03-18T11:58:32.094",
                    cogsDimensionConstraints: [],
                    catDimensionConstraints: [],
                    lastLogin: "2025-03-28T06:52:23.700",
                    selfRegistered: false,
                    invitation: false,
                    disabled: false,
                    surname: "Wakiki",
                    firstName: "Tom",
                    phoneNumber: "+233223232",
                    jobTitle: "System Administrator",
                    introduction: "I am the system administrator in Sierra Leone",
                    gender: "gender_male",
                    birthday: "1976-06-03T00:00:00.000",
                    nationality: "Sierra Leone",
                    employer: "Sierra Leone Ministry of Health",
                    education: "System administration",
                    interests: "Computer systems",
                    languages: "English",
                    lastCheckedInterpretations: "2016-10-13T11:41:51.443",
                    organisationUnits: [
                        {
                            id: "ImspTQPwCqd",
                        },
                    ],
                    dataViewOrganisationUnits: [],
                    teiSearchOrganisationUnits: [],
                    twoFactorEnabled: false,
                    userCredentials: {
                        id: "GOLswS44mh8",
                        username: "system",
                        externalAuth: false,
                        twoFA: false,
                        passwordLastUpdated: "2021-03-18T11:58:32.094",
                        cogsDimensionConstraints: [],
                        catDimensionConstraints: [],
                        previousPasswords: [],
                        lastLogin: "2025-03-28T06:52:23.700",
                        selfRegistered: false,
                        invitation: false,
                        disabled: false,
                        access: {
                            manage: true,
                            externalize: true,
                            write: true,
                            read: true,
                            update: true,
                            delete: true,
                        },
                        sharing: {
                            owner: "system-process",
                            external: false,
                            users: {},
                            userGroups: {},
                        },
                        userRoles: [
                            {
                                id: "UYXOT4A7JMI",
                            },
                            {
                                id: "LGWLyWNro4x",
                            },
                        ],
                    },
                    displayName: "Tom Wakiki",
                    access: {
                        manage: true,
                        externalize: true,
                        write: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    id: "GOLswS44mh8",
                    attributeValues: [],
                    userRoles: [
                        {
                            id: "UYXOT4A7JMI",
                        },
                        {
                            id: "LGWLyWNro4x",
                        },
                    ],
                    userGroups: [
                        {
                            id: "M1Qre0247G3",
                        },
                        {
                            id: "pBnkuih0c1K",
                        },
                        {
                            id: "wl5cDMuUhmF",
                        },
                        {
                            id: "qlEhuAA77gc",
                        },
                        {
                            id: "QYrzIjSfI8z",
                        },
                        {
                            id: "lFHP5lLkzVr",
                        },
                        {
                            id: "L4XTzgbdza3",
                        },
                        {
                            id: "jvrEwEJ2yZn",
                        },
                        {
                            id: "vAvEltyXGbD",
                        },
                        {
                            id: "zz6XckBrLlj",
                        },
                    ],
                },
                {
                    name: "Guest User",
                    created: "2014-10-07T22:17:43.562",
                    lastUpdated: "2021-03-18T11:59:01.285",
                    translations: [],
                    favorites: [],
                    sharing: {
                        external: false,
                        users: {},
                        userGroups: {},
                    },
                    username: "guest",
                    externalAuth: false,
                    passwordLastUpdated: "2021-03-18T11:59:01.240",
                    cogsDimensionConstraints: [],
                    catDimensionConstraints: [],
                    lastLogin: "2014-10-07T22:17:43.434",
                    selfRegistered: false,
                    invitation: false,
                    disabled: false,
                    surname: "User",
                    firstName: "Guest",
                    organisationUnits: [
                        {
                            id: "ImspTQPwCqd",
                        },
                    ],
                    dataViewOrganisationUnits: [],
                    teiSearchOrganisationUnits: [],
                    twoFactorEnabled: false,
                    userCredentials: {
                        id: "rWLrZL8rP3K",
                        username: "guest",
                        externalAuth: false,
                        twoFA: false,
                        passwordLastUpdated: "2021-03-18T11:59:01.240",
                        cogsDimensionConstraints: [],
                        catDimensionConstraints: [],
                        previousPasswords: [],
                        lastLogin: "2014-10-07T22:17:43.434",
                        restoreToken: "$2a$10$qdHdJe70XCPHcyqVUnL99OAE8hrOvMpoBGE5aMMdaE89.Q1FgKEym",
                        restoreExpiry: "2014-10-08T00:00:00.000",
                        selfRegistered: false,
                        invitation: false,
                        disabled: false,
                        access: {
                            manage: true,
                            externalize: true,
                            write: true,
                            read: true,
                            update: true,
                            delete: true,
                        },
                        sharing: {
                            external: false,
                            users: {},
                            userGroups: {},
                        },
                        userRoles: [
                            {
                                id: "XS0dNzuZmfH",
                            },
                        ],
                    },
                    displayName: "Guest User",
                    access: {
                        manage: true,
                        externalize: true,
                        write: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    favorite: false,
                    id: "rWLrZL8rP3K",
                    attributeValues: [],
                    userRoles: [
                        {
                            id: "XS0dNzuZmfH",
                        },
                    ],
                    userGroups: [],
                },
                {
                    name: "John Traore",
                    created: "2013-04-18T17:15:08.407",
                    lastUpdated: "2025-03-28T06:48:13.412",
                    translations: [],
                    createdBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    sharing: {
                        external: false,
                        users: {},
                        userGroups: {},
                    },
                    username: "admin",
                    externalAuth: false,
                    passwordLastUpdated: "2014-12-18T20:56:05.264",
                    cogsDimensionConstraints: [],
                    catDimensionConstraints: [],
                    lastLogin: "2025-03-28T06:48:13.412",
                    selfRegistered: false,
                    invitation: false,
                    disabled: false,
                    surname: "Traore",
                    firstName: "John",
                    email: "dummy@dhis2.org",
                    jobTitle: "Super user",
                    introduction: "I am the super user of DHIS 2",
                    gender: "gender_male",
                    birthday: "1971-04-08T00:00:00.000",
                    nationality: "Sierra Leone",
                    employer: "DHIS",
                    education: "Master of super using",
                    interests: "Football, swimming, singing, dancing",
                    languages: "English",
                    lastCheckedInterpretations: "2025-03-28T04:56:49.883",
                    whatsApp: "+123123123123",
                    facebookMessenger: "john.traore",
                    skype: "john.traore",
                    telegram: "john.traore",
                    twitter: "john.traore",
                    organisationUnits: [
                        {
                            id: "ImspTQPwCqd",
                        },
                    ],
                    dataViewOrganisationUnits: [],
                    teiSearchOrganisationUnits: [],
                    twoFactorEnabled: false,
                    userCredentials: {
                        id: "xE7jOejl9FI",
                        username: "admin",
                        externalAuth: false,
                        twoFA: false,
                        passwordLastUpdated: "2014-12-18T20:56:05.264",
                        cogsDimensionConstraints: [],
                        catDimensionConstraints: [],
                        previousPasswords: [],
                        lastLogin: "2025-03-28T06:48:13.412",
                        selfRegistered: false,
                        invitation: false,
                        disabled: false,
                        access: {
                            manage: true,
                            externalize: true,
                            write: true,
                            read: true,
                            update: true,
                            delete: true,
                        },
                        sharing: {
                            external: false,
                            users: {},
                            userGroups: {},
                        },
                        userRoles: [
                            {
                                id: "UYXOT4A7JMI",
                            },
                            {
                                id: "Ufph3mGRmMo",
                            },
                            {
                                id: "Euq3XfEIEbx",
                            },
                            {
                                id: "aNk5AyC7ydy",
                            },
                            {
                                id: "cUlTcejWree",
                            },
                            {
                                id: "TMK9CMZ2V98",
                            },
                            {
                                id: "Ql6Gew7eaX6",
                            },
                            {
                                id: "Pqoy4DLOdMK",
                            },
                            {
                                id: "DRdaVRtwmG5",
                            },
                            {
                                id: "jRWSNIHdKww",
                            },
                            {
                                id: "txB7vu1w2Pr",
                            },
                            {
                                id: "XS0dNzuZmfH",
                            },
                            {
                                id: "xJZBzAHI88H",
                            },
                        ],
                    },
                    displayName: "John Traore",
                    access: {
                        manage: true,
                        externalize: true,
                        write: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    favorite: false,
                    user: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    id: "xE7jOejl9FI",
                    attributeValues: [],
                    userRoles: [
                        {
                            id: "UYXOT4A7JMI",
                        },
                        {
                            id: "Ufph3mGRmMo",
                        },
                        {
                            id: "Euq3XfEIEbx",
                        },
                        {
                            id: "aNk5AyC7ydy",
                        },
                        {
                            id: "cUlTcejWree",
                        },
                        {
                            id: "TMK9CMZ2V98",
                        },
                        {
                            id: "Ql6Gew7eaX6",
                        },
                        {
                            id: "Pqoy4DLOdMK",
                        },
                        {
                            id: "DRdaVRtwmG5",
                        },
                        {
                            id: "jRWSNIHdKww",
                        },
                        {
                            id: "txB7vu1w2Pr",
                        },
                        {
                            id: "XS0dNzuZmfH",
                        },
                        {
                            id: "xJZBzAHI88H",
                        },
                    ],
                    userGroups: [
                        {
                            id: "Kk12LkEWtXp",
                        },
                        {
                            id: "M1Qre0247G3",
                        },
                        {
                            id: "NTC8GjJ7p8P",
                        },
                        {
                            id: "B6JNeAQ6akX",
                        },
                        {
                            id: "wl5cDMuUhmF",
                        },
                        {
                            id: "QYrzIjSfI8z",
                        },
                        {
                            id: "lFHP5lLkzVr",
                        },
                        {
                            id: "jvrEwEJ2yZn",
                        },
                        {
                            id: "vAvEltyXGbD",
                        },
                        {
                            id: "w900PX10L7O",
                        },
                        {
                            id: "GogLpGmkL0g",
                        },
                        {
                            id: "vRoAruMnNpB",
                        },
                        {
                            id: "z1gNAf2zUxZ",
                        },
                        {
                            id: "gXpmQO6eEOo",
                        },
                        {
                            id: "tH0GcNZZ1vW",
                        },
                        {
                            id: "H9XnHoWRKCg",
                        },
                    ],
                },
            ],
        },
        third: {
            userRoles: [
                {
                    name: "Antenatal care program",
                    created: "2016-04-05T23:54:04.405",
                    lastUpdated: "2017-01-19T11:39:39.906",
                    translations: [],
                    createdBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    favorites: [],
                    sharing: {
                        owner: "xE7jOejl9FI",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "Access to the antenatal care program",
                    authorities: [],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "wqFivBzTq3r",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "T4AwvxjfaFy",
                        },
                        {
                            id: "xvfpjHAngDE",
                        },
                        {
                            id: "TGffsAIhDjd",
                        },
                        {
                            id: "DdfFqqZkBhd",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "t6ijJxbHBCa",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "AIK2aQOJIbj",
                        },
                        {
                            id: "wQ1F32Aa9Ug",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "Ls4RGG9xEAf",
                        },
                        {
                            id: "sY16gfCRrla",
                        },
                        {
                            id: "NDXCID2HkYy",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "k0pJIVKAJz3",
                        },
                        {
                            id: "OhBMBATrkP7",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "NO74DaadTdK",
                        },
                        {
                            id: "OF1mSOFpygN",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "LzGINtooAmK",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "JyMUTHHxh3B",
                        },
                        {
                            id: "TLILGeK5aBx",
                        },
                        {
                            id: "xNW0W2jO6Ir",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "tsxW8w0KNe3",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "ittdM3r942E",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "yarlPr6DsOF",
                        },
                        {
                            id: "cFWMFtK4PQL",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "GOLswS44mh8",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "VmcjllruaJh",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "A3eEvwGueIH",
                        },
                        {
                            id: "D6bJvkVFx6R",
                        },
                        {
                            id: "I54UvDN8cz8",
                        },
                        {
                            id: "FLDWwCTIsv9",
                        },
                        {
                            id: "ygh8rOt4dIO",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "I9jt9WOztz6",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "NG6JReWSInT",
                        },
                        {
                            id: "FVsLhslRbTK",
                        },
                        {
                            id: "tQSUE8azWFG",
                        },
                        {
                            id: "lfRiUQewoOd",
                        },
                        {
                            id: "ihiElEI8kef",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "Antenatal care program",
                    access: {
                        manage: true,
                        externalize: true,
                        write: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    favorite: false,
                    user: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    id: "UYXOT4A7JMI",
                    attributeValues: [],
                },
                {
                    name: "System administrator (ALL)",
                    created: "2012-08-02T16:53:37.078",
                    lastUpdated: "2017-05-16T16:53:52.045",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "System administrator",
                    authorities: ["ALL"],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "wqFivBzTq3r",
                        },
                        {
                            id: "T4AwvxjfaFy",
                        },
                        {
                            id: "xvfpjHAngDE",
                        },
                        {
                            id: "TGffsAIhDjd",
                        },
                        {
                            id: "DdfFqqZkBhd",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "t6ijJxbHBCa",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "wQ1F32Aa9Ug",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "Ls4RGG9xEAf",
                        },
                        {
                            id: "sY16gfCRrla",
                        },
                        {
                            id: "NDXCID2HkYy",
                        },
                        {
                            id: "k0pJIVKAJz3",
                        },
                        {
                            id: "OhBMBATrkP7",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "NO74DaadTdK",
                        },
                        {
                            id: "OF1mSOFpygN",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "LzGINtooAmK",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "JyMUTHHxh3B",
                        },
                        {
                            id: "TLILGeK5aBx",
                        },
                        {
                            id: "xNW0W2jO6Ir",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "tsxW8w0KNe3",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "ittdM3r942E",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "yarlPr6DsOF",
                        },
                        {
                            id: "cFWMFtK4PQL",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "GOLswS44mh8",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "VmcjllruaJh",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "A3eEvwGueIH",
                        },
                        {
                            id: "D6bJvkVFx6R",
                        },
                        {
                            id: "I54UvDN8cz8",
                        },
                        {
                            id: "ygh8rOt4dIO",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "I9jt9WOztz6",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "NG6JReWSInT",
                        },
                        {
                            id: "FVsLhslRbTK",
                        },
                        {
                            id: "tQSUE8azWFG",
                        },
                        {
                            id: "lfRiUQewoOd",
                        },
                        {
                            id: "ihiElEI8kef",
                        },
                    ],
                    displayName: "System administrator (ALL)",
                    access: {
                        manage: true,
                        externalize: true,
                        write: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    id: "LGWLyWNro4x",
                    attributeValues: [],
                },
            ],
        },
        fourth: {
            userRoles: [
                {
                    name: "Guest",
                    created: "2018-12-03T12:45:51.857",
                    lastUpdated: "2018-12-03T12:45:51.857",
                    translations: [],
                    createdBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    sharing: {
                        owner: "xE7jOejl9FI",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "Read-only",
                    authorities: [
                        "M_dhis-web-light",
                        "M_dhis-web-interpretation",
                        "M_dhis-web-pivot",
                        "M_dhis-web-mobile",
                        "M_dhis-web-messaging",
                        "M_dhis-web-data-visualizer",
                        "M_dhis-web-mapping",
                        "M_dhis-web-dashboard",
                        "M_dhis-web-visualizer",
                        "M_dhis-web-maps",
                    ],
                    restrictions: [],
                    displayName: "Guest",
                    access: {
                        manage: true,
                        externalize: true,
                        write: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "gEnZri18JsV",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "qDNQJROsrzY",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "N3PZBUlN8vq",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "rWLrZL8rP3K",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "EZtxytGsq8F",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    favorite: false,
                    user: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    id: "XS0dNzuZmfH",
                    attributeValues: [],
                },
            ],
        },
        fifth: {
            userRoles: [
                {
                    name: "Child Health Program Manager",
                    created: "2015-01-08T11:57:27.022",
                    lastUpdated: "2015-01-20T11:48:11.005",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "Child Health Program Manager",
                    authorities: [],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "Child Health Program Manager",
                    access: {
                        manage: true,
                        externalize: true,
                        write: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    id: "Ql6Gew7eaX6",
                    attributeValues: [],
                },
                {
                    name: "Child Health Tracker",
                    created: "2013-04-09T21:47:59.640",
                    lastUpdated: "2015-10-20T12:07:20.872",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "Access to the child health program in tracker",
                    authorities: [],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "N3PZBUlN8vq",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "AIK2aQOJIbj",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "FLDWwCTIsv9",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "Child Health Tracker",
                    access: {
                        manage: true,
                        externalize: true,
                        write: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    id: "TMK9CMZ2V98",
                    attributeValues: [],
                },
                {
                    name: "Data entry clerk",
                    created: "2012-11-13T15:56:57.955",
                    lastUpdated: "2022-10-19T11:17:02.298",
                    translations: [],
                    createdBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    sharing: {
                        owner: "xE7jOejl9FI",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "Data entry clerk",
                    authorities: [
                        "M_dhis-web-aggregate-data-entry",
                        "M_dhis-web-dataentry",
                        "M_dhis-web-dashboard",
                        "F_DATAVALUE_ADD",
                        "M_dhis-web-maps",
                    ],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "AIK2aQOJIbj",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "PhzytPW3g2J",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "DXyJmlo9rge",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "N3PZBUlN8vq",
                        },
                        {
                            id: "ObaborECU7w",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "FLDWwCTIsv9",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "Data entry clerk",
                    access: {
                        manage: true,
                        externalize: true,
                        write: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    favorite: false,
                    user: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    id: "Euq3XfEIEbx",
                    attributeValues: [],
                },
                {
                    name: "Facility tracker",
                    created: "2012-11-20T22:07:53.822",
                    lastUpdated: "2018-02-19T14:47:44.781",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "Tracker user at the facility",
                    authorities: [
                        "F_PROGRAM_INDICATOR_PUBLIC_ADD",
                        "F_RELATIONSHIP_ADD",
                        "F_SCHEDULING_SEND_MESSAGE",
                        "M_dhis-web-pivot",
                        "F_PROGRAM_TRACKING_SEARCH",
                        "F_RELATIONSHIP_MANAGEMENT",
                        "F_ANONYMOUS_DATA_ENTRY",
                        "F_GENERATE_BENEFICIARY_TABULAR_REPORT",
                        "F_SCHEDULING_ADMIN",
                        "M_dhis-web-caseentry",
                        "M_dhis-web-light",
                        "F_TRACKED_ENTITY_COMMENT_DELETE",
                        "F_SINGLE_EVENT_DATA_ENTRY",
                        "F_GENERATE_STATISTICAL_PROGRAM_REPORT",
                        "M_dhis-web-tracker-capture",
                        "M_dhis-web-event-capture",
                        "F_TRACKED_ENTITY_COMMENT_ADD",
                        "M_dhis-web-sms",
                        "F_TRACKED_ENTITY_INSTANCE_MANAGEMENT",
                        "F_PROGRAM_INSTANCE_MANAGEMENT",
                        "M_dhis-web-visualizer",
                        "M_dhis-web-maps",
                        "F_TRACKED_ENTITY_INSTANCE_LIST",
                        "M_dhis-web-mobile",
                        "F_PROGRAM_TRACKING_LIST",
                        "F_ACTIVITY_PLAN",
                        "M_dhis-web-data-visualizer",
                        "F_PROGRAM_INSTANCE_DELETE",
                        "M_dhis-web-dashboard",
                        "F_TRACKED_ENTITY_INSTANCE_HISTORY",
                        "F_PROGRAM_STAGE_INSTANCE_DELETE",
                        "F_TRACKED_ENTITY_INSTANCE_CHANGE_LOCATION",
                        "M_dhis-web-scheduler",
                        "M_dhis-web-capture",
                        "F_PROGRAM_TRACKING_MANAGEMENT",
                        "F_GENERATE_PROGRAM_SUMMARY_REPORT",
                        "F_MOBILE_SENDSMS",
                        "F_NAME_BASED_DATA_ENTRY",
                        "F_RELATIONSHIP_DELETE",
                        "M_dhis-web-mapping",
                        "F_TRACKED_ENTITY_INSTANCE_DASHBOARD",
                        "F_PROGRAM_STAGE_INSTANCE_SEARCH",
                    ],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "AIK2aQOJIbj",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "PhzytPW3g2J",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "FLDWwCTIsv9",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "DXyJmlo9rge",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "Facility tracker",
                    access: {
                        manage: true,
                        externalize: true,
                        write: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    id: "txB7vu1w2Pr",
                    attributeValues: [],
                },
                {
                    name: "Inpatient program",
                    created: "2013-04-09T21:47:12.114",
                    lastUpdated: "2014-11-20T15:57:19.613",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "Access to the inpatient program in tracker",
                    authorities: [],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "AIK2aQOJIbj",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "FLDWwCTIsv9",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "DXyJmlo9rge",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "Inpatient program",
                    access: {
                        manage: true,
                        externalize: true,
                        write: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    id: "DRdaVRtwmG5",
                    attributeValues: [],
                },
                {
                    name: "M and E Officer",
                    created: "2018-12-03T12:45:35.034",
                    lastUpdated: "2025-03-26T15:49:48.410",
                    translations: [],
                    createdBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    sharing: {
                        owner: "xE7jOejl9FI",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "M and E Officer",
                    authorities: [
                        "M_dhis-web-interpretation",
                        "F_USER_VIEW",
                        "F_VALIDATIONRULE_PUBLIC_ADD",
                        "F_SCHEDULING_ADMIN",
                        "M_linelisting",
                        "M_dhis-web-event-capture",
                        "M_dhis-web-sms",
                        "F_DATAVALUE_ADD",
                        "F_INSERT_CUSTOM_JS_CSS",
                        "M_dhis-web-visualizer",
                        "M_dhis-web-event-reports",
                        "F_VIEW_UNAPPROVED_DATA",
                        "M_dhis-web-mobile",
                        "F_ACTIVITY_PLAN",
                        "F_INDICATOR_PRIVATE_ADD",
                        "M_dhis-web-cache-cleaner",
                        "M_dhis-web-event-visualizer",
                        "F_ACCESS_TRACKED_ENTITY_ATTRIBUTES",
                        "F_USER_ADD",
                        "F_DOCUMENT_PRIVATE_ADD",
                        "F_APPROVE_DATA_LOWER_LEVELS",
                        "M_dhis-web-datastore",
                        "M_dhis-web-data-quality",
                        "F_REPORT_PUBLIC_ADD",
                        "M_dhis-web-dataentry",
                        "M_dhis-web-pivot",
                        "M_dhis-web-usage-analytics",
                        "M_dhis-web-validationrule",
                        "M_dhis-web-caseentry",
                        "M_dhis-web-light",
                        "M_dhis-web-importexport",
                        "M_dhis-web-settings",
                        "F_VIEW_DATABROWSER",
                        "M_dhis-web-tracker-capture",
                        "F_DATASET_PUBLIC_ADD",
                        "F_USER_DELETE",
                        "F_SEND_MESSAGE",
                        "M_dhis-web-maps",
                        "M_dhis-web-maintenance-user",
                        "M_dhis-web-maintenance-appmanager",
                        "M_dhis-web-reporting",
                        "M_dhis-web-maintenance-settings",
                        "M_dhis-web-data-visualizer",
                        "M_dhis-web-maintenance-datadictionary",
                        "M_dhis-web-dashboard",
                        "F_DATASET_DELETE",
                        "F_ACCEPT_DATA_LOWER_LEVELS",
                        "F_APPROVE_DATA",
                        "M_dhis-web-scheduler",
                        "M_dhis-web-capture",
                        "M_dhis-web-messaging",
                        "M_dhis-web-mapping",
                    ],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "IC1o0DI2iWu",
                        },
                        {
                            id: "L2B791gfbds",
                        },
                        {
                            id: "yI9qQfuM7Xd",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "CotVI2NX0rI",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "rH2032EPFvr",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "SpuKahMLsAr",
                        },
                        {
                            id: "nTR8wpj581i",
                        },
                        {
                            id: "ThTAClUCwgA",
                        },
                        {
                            id: "jbPricQDF8n",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "cgRLEcDKUpZ",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "HrP0i2FzUnR",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "ga5Y0Wg5kof",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "DLjZWMsVsq2",
                        },
                        {
                            id: "QqvaU7JjkUV",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "nFNQNgrbTED",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "ppnpAn26Oa8",
                        },
                        {
                            id: "Kh68cDMwZsg",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "cn4PwMeVOaN",
                        },
                        {
                            id: "FGRIfGf342V",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "Z0Gq4MesQBY",
                        },
                        {
                            id: "DXyJmlo9rge",
                        },
                        {
                            id: "I9fMsY4pRKk",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "zEag1whWJ3B",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "Veu64cIQChe",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "Rq9TNYOyS6a",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "ShrDpIA8nQg",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "FfQ2460chiA",
                        },
                        {
                            id: "Onf73mPD6sL",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "cmqG3zxcsCu",
                        },
                        {
                            id: "UgDpalMTGDr",
                        },
                        {
                            id: "G2ysGXpcZWr",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "yppgnhxP8Pa",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "WYDN4b4yRlg",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "SJIZXODVs1o",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "yeaqurD8gyd",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "OYLGMiazHtW",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EGwENMFCpbm",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "NOOF56dveaZ",
                        },
                        {
                            id: "Gb8nYT2iJsj",
                        },
                        {
                            id: "y0yJvbxD6Fx",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "M and E Officer",
                    access: {
                        manage: true,
                        externalize: true,
                        write: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    favorite: false,
                    user: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    id: "jRWSNIHdKww",
                    attributeValues: [],
                },
                {
                    name: "MNCH / PNC (Adult Woman) program",
                    created: "2013-04-09T21:47:42.091",
                    lastUpdated: "2016-06-28T11:08:58.716",
                    translations: [],
                    createdBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    favorites: [],
                    sharing: {
                        owner: "xE7jOejl9FI",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "Access to the MNCH program in tracker",
                    authorities: [],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "AIK2aQOJIbj",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "FLDWwCTIsv9",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "MNCH / PNC (Adult Woman) program",
                    access: {
                        manage: true,
                        externalize: true,
                        write: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    favorite: false,
                    user: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    id: "aNk5AyC7ydy",
                    attributeValues: [],
                },
                {
                    name: "Superuser",
                    created: "2019-04-25T14:22:00.262",
                    lastUpdated: "2025-03-26T15:50:27.048",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "Superuser",
                    authorities: [
                        "F_PROGRAM_INDICATOR_PUBLIC_ADD",
                        "F_USER_VIEW",
                        "F_GENERATE_MIN_MAX_VALUES",
                        "F_VALIDATIONRULE_PUBLIC_ADD",
                        "F_CATEGORY_PRIVATE_ADD",
                        "F_INDICATORGROUPSET_PUBLIC_ADD",
                        "F_EXTERNAL_MAP_LAYER_PRIVATE_ADD",
                        "F_RELATIONSHIPTYPE_DELETE",
                        "F_CATEGORY_OPTION_PRIVATE_ADD",
                        "F_CATEGORY_OPTION_GROUP_PUBLIC_ADD",
                        "M_linelisting",
                        "F_SEND_EMAIL",
                        "M_dhis-web-aggregate-data-entry",
                        "F_ORGUNITGROUPSET_PRIVATE_ADD",
                        "F_INDICATOR_DELETE",
                        "M_dhis-web-event-reports",
                        "F_VIEW_UNAPPROVED_DATA",
                        "F_USERGROUP_MANAGING_RELATIONSHIPS_VIEW",
                        "F_OPTIONGROUPSET_DELETE",
                        "F_USERGROUP_PUBLIC_ADD",
                        "F_PROGRAM_INDICATOR_GROUP_PRIVATE_ADD",
                        "F_DOCUMENT_EXTERNAL",
                        "F_TRACKED_ENTITY_ATTRIBUTE_PUBLIC_ADD",
                        "F_PROGRAM_INDICATOR_DELETE",
                        "F_MOBILE_SENDSMS",
                        "F_TRACKED_ENTITY_ADD",
                        "F_VALIDATIONRULEGROUP_PUBLIC_ADD",
                        "F_REPORT_EXTERNAL",
                        "F_DOCUMENT_PRIVATE_ADD",
                        "M_dhis-web-reports",
                        "F_TRACKED_ENTITY_DELETE",
                        "F_USERGROUP_DELETE",
                        "F_PROGRAM_PRIVATE_ADD",
                        "F_CATEGORY_COMBO_PRIVATE_ADD",
                        "F_EXTERNAL_MAP_LAYER_PUBLIC_ADD",
                        "F_PROGRAM_INDICATOR_GROUP_DELETE",
                        "F_ORGANISATIONUNIT_MOVE",
                        "M_dhis-web-usage-analytics",
                        "F_INDICATORGROUP_DELETE",
                        "F_ORGANISATIONUNIT_DELETE",
                        "F_PROGRAM_RULE_ADD",
                        "F_OPTIONGROUPSET_PRIVATE_ADD",
                        "F_DATASET_PUBLIC_ADD",
                        "F_CATEGORY_COMBO_DELETE",
                        "F_SECTION_DELETE",
                        "F_USER_DELETE",
                        "F_INDICATORGROUPSET_PRIVATE_ADD",
                        "F_PROGRAM_INDICATOR_PRIVATE_ADD",
                        "F_METADATA_IMPORT",
                        "F_EXPORT_EVENTS",
                        "F_SQLVIEW_PUBLIC_ADD",
                        "F_PERFORM_MAINTENANCE",
                        "F_METADATA_EXPORT",
                        "F_MINMAX_DATAELEMENT_ADD",
                        "F_DATAELEMENTGROUP_PRIVATE_ADD",
                        "F_VALIDATIONRULE_PRIVATE_ADD",
                        "F_APPROVE_DATA",
                        "F_DATAELEMENT_PRIVATE_ADD",
                        "F_TRACKED_ENTITY_INSTANCE_SEARCH_IN_ALL_ORGUNITS",
                        "F_IGNORE_TRACKER_REQUIRED_VALUE_VALIDATION",
                        "F_PROGRAM_PUBLIC_ADD",
                        "F_CATEGORY_OPTION_GROUP_SET_PRIVATE_ADD",
                        "F_CATEGORY_OPTION_GROUP_SET_DELETE",
                        "F_USER_ADD_WITHIN_MANAGED_GROUP",
                        "F_ORGANISATIONUNIT_ADD",
                        "M_dhis-web-user",
                        "F_LEGEND_SET_PUBLIC_ADD",
                        "F_CONSTANT_ADD",
                        "F_PREDICTORGROUP_DELETE",
                        "F_INDICATOR_PUBLIC_ADD",
                        "F_INDICATORGROUP_PUBLIC_ADD",
                        "F_TRACKED_ENTITY_ATTRIBUTE_PRIVATE_ADD",
                        "M_dhis-web-maintenance",
                        "M_dhis-web-approval",
                        "F_PROGRAM_RULE_MANAGEMENT",
                        "F_TEI_CASCADE_DELETE",
                        "F_VISUALIZATION_EXTERNAL",
                        "M_dhis-web-cache-cleaner",
                        "F_EDIT_EXPIRED",
                        "F_PROGRAM_DASHBOARD_CONFIG_ADMIN",
                        "F_EVENT_VISUALIZATION_EXTERNAL",
                        "F_ORGANISATIONUNITLEVEL_UPDATE",
                        "F_CATEGORY_OPTION_PUBLIC_ADD",
                        "M_dhis-web-datastore",
                        "F_CATEGORY_OPTION_DELETE",
                        "M_dhis-web-menu-management",
                        "F_REPORT_PUBLIC_ADD",
                        "F_VALIDATIONRULEGROUP_DELETE",
                        "F_OPTIONSET_PRIVATE_ADD",
                        "F_PROGRAM_RULE_DELETE",
                        "F_ORGUNITGROUP_DELETE",
                        "F_DATAELEMENTGROUPSET_PRIVATE_ADD",
                        "M_dhis-web-tracker-capture",
                        "F_LOCALE_ADD",
                        "F_CATEGORY_OPTION_GROUP_PRIVATE_ADD",
                        "F_CATEGORY_PUBLIC_ADD",
                        "F_SECTION_ADD",
                        "F_CATEGORY_COMBO_PUBLIC_ADD",
                        "F_DATASET_DELETE",
                        "F_INDICATORGROUPSET_DELETE",
                        "F_USER_DELETE_WITHIN_MANAGED_GROUP",
                        "M_dhis-web-scheduler",
                        "F_OPTIONGROUP_PUBLIC_ADD",
                        "F_USERROLE_PRIVATE_ADD",
                        "M_dhis-web-messaging",
                        "F_MAP_EXTERNAL",
                        "F_VIEW_SERVER_INFO",
                        "F_DATAELEMENTGROUPSET_PUBLIC_ADD",
                        "F_DATAELEMENTGROUP_DELETE",
                        "F_USERGROUP_MANAGING_RELATIONSHIPS_ADD",
                        "F_ORGUNITGROUP_PRIVATE_ADD",
                        "F_DATAELEMENTGROUP_PUBLIC_ADD",
                        "F_USER_GROUPS_READ_ONLY_ADD_MEMBERS",
                        "F_PREDICTOR_RUN",
                        "F_DATAELEMENT_DELETE",
                        "F_OPTIONGROUP_DELETE",
                        "F_LEGEND_SET_PRIVATE_ADD",
                        "F_PROGRAMSTAGE_DELETE",
                        "F_ATTRIBUTE_PUBLIC_ADD",
                        "F_USERROLE_DELETE",
                        "F_DOCUMENT_DELETE",
                        "F_ORGUNITGROUPSET_DELETE",
                        "M_dhis-web-translations",
                        "F_PROGRAM_DELETE",
                        "F_VALIDATIONRULE_DELETE",
                        "F_DATA_APPROVAL_LEVEL",
                        "F_RELATIONSHIPTYPE_PUBLIC_ADD",
                        "F_PREDICTOR_ADD",
                        "F_SQLVIEW_PRIVATE_ADD",
                        "F_EXPORT_DATA",
                        "F_OAUTH2_CLIENT_MANAGE",
                        "F_EVENT_VISUALIZATION_PUBLIC_ADD",
                        "F_ORGUNITGROUP_PUBLIC_ADD",
                        "F_APPROVE_DATA_LOWER_LEVELS",
                        "F_OPTIONSET_PUBLIC_ADD",
                        "F_EVENTCHART_EXTERNAL",
                        "M_dhis-web-dataentry",
                        "M_dhis-web-import-export",
                        "F_USERROLE_PUBLIC_ADD",
                        "F_ORGUNITGROUPSET_PUBLIC_ADD",
                        "F_SQLVIEW_EXTERNAL",
                        "F_REPORT_DELETE",
                        "F_DASHBOARD_PUBLIC_ADD",
                        "F_CONSTANT_DELETE",
                        "F_PREDICTOR_DELETE",
                        "M_dhis-web-data-visualizer",
                        "F_DATASET_PRIVATE_ADD",
                        "F_EVENTREPORT_PUBLIC_ADD",
                        "F_TRACKED_ENTITY_UPDATE",
                        "F_CATEGORY_OPTION_GROUP_SET_PUBLIC_ADD",
                        "F_METADATA_MANAGE",
                        "F_ANALYTICSTABLEHOOK_DELETE",
                        "F_UNCOMPLETE_EVENT",
                        "M_dhis-web-sms-configuration",
                        "M_dhis-web-interpretation",
                        "F_MAP_PUBLIC_ADD",
                        "F_SCHEDULING_ADMIN",
                        "F_PREDICTORGROUP_ADD",
                        "F_REPORT_PRIVATE_ADD",
                        "F_VALIDATIONRULEGROUP_PRIVATE_ADD",
                        "F_PUSH_ANALYSIS_DELETE",
                        "F_REPLICATE_USER",
                        "F_DATAVALUE_ADD",
                        "F_INSERT_CUSTOM_JS_CSS",
                        "F_DATAELEMENTGROUPSET_DELETE",
                        "F_SQLVIEW_DELETE",
                        "F_ENROLLMENT_CASCADE_DELETE",
                        "F_INDICATORTYPE_ADD",
                        "F_LEGEND_SET_DELETE",
                        "F_VIEW_EVENT_ANALYTICS",
                        "F_IMPORT_EVENTS",
                        "F_INDICATOR_PRIVATE_ADD",
                        "F_EVENTCHART_PUBLIC_ADD",
                        "F_PUSH_ANALYSIS_ADD",
                        "M_dhis-web-event-visualizer",
                        "F_USER_ADD",
                        "F_EXTERNAL_MAP_LAYER_DELETE",
                        "F_SYSTEM_SETTING",
                        "F_ANALYTICSTABLEHOOK_ADD",
                        "F_ATTRIBUTE_PRIVATE_ADD",
                        "F_DOCUMENT_PUBLIC_ADD",
                        "F_TRACKED_ENTITY_ATTRIBUTE_DELETE",
                        "F_VISUALIZATION_PUBLIC_ADD",
                        "M_dhis-web-data-quality",
                        "F_EVENTREPORT_EXTERNAL",
                        "F_DATAELEMENT_PUBLIC_ADD",
                        "F_RUN_VALIDATION",
                        "F_OPTIONGROUP_PRIVATE_ADD",
                        "F_CATEGORY_OPTION_GROUP_DELETE",
                        "M_dhis-web-settings",
                        "F_IMPORT_DATA",
                        "F_PERFORM_ANALYTICS_EXPLAIN",
                        "F_DATA_APPROVAL_WORKFLOW",
                        "F_PROGRAMSTAGE_ADD",
                        "M_dhis-web-maps",
                        "F_ATTRIBUTE_DELETE",
                        "F_OPTIONSET_DELETE",
                        "M_dhis-web-dashboard",
                        "M_dhis-web-data-administration",
                        "F_ACCEPT_DATA_LOWER_LEVELS",
                        "F_OPTIONGROUPSET_PUBLIC_ADD",
                        "M_dhis-web-capture",
                        "F_PROGRAM_INDICATOR_GROUP_PUBLIC_ADD",
                        "F_CATEGORY_DELETE",
                        "M_dhis-web-app-management",
                        "F_INDICATORTYPE_DELETE",
                        "F_INDICATORGROUP_PRIVATE_ADD",
                    ],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "cddnwKV2gm9",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "oXD88WWSQpR",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "DXyJmlo9rge",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "awtnYWiVEd5",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "Superuser",
                    access: {
                        manage: true,
                        externalize: true,
                        write: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    id: "Ufph3mGRmMo",
                    attributeValues: [],
                },
                {
                    name: "TB program",
                    created: "2013-04-09T21:48:27.303",
                    lastUpdated: "2018-02-19T12:04:00.600",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "Access to the TB program in Tracker",
                    authorities: [
                        "F_APPROVE_DATA",
                        "M_dhis-web-pivot",
                        "F_VIEW_UNAPPROVED_DATA",
                        "M_dhis-web-data-visualizer",
                        "M_dhis-web-mapping",
                        "M_dhis-web-dashboard",
                        "F_APPROVE_DATA_LOWER_LEVELS",
                        "M_dhis-web-visualizer",
                        "M_dhis-web-maps",
                    ],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "N3PZBUlN8vq",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "AIK2aQOJIbj",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "FLDWwCTIsv9",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "DXyJmlo9rge",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "TB program",
                    access: {
                        manage: true,
                        externalize: true,
                        write: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    id: "cUlTcejWree",
                    attributeValues: [],
                },
                {
                    name: "User manager",
                    created: "2014-12-26T14:21:00.602",
                    lastUpdated: "2018-02-19T12:04:23.711",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "User manager",
                    authorities: [
                        "M_dhis-web-maintenance-user",
                        "F_USER_VIEW",
                        "F_USER_ADD",
                        "M_dhis-web-dashboard",
                        "F_USER_DELETE",
                    ],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "N3PZBUlN8vq",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "I9fMsY4pRKk",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "User manager",
                    access: {
                        manage: true,
                        externalize: true,
                        write: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    id: "xJZBzAHI88H",
                    attributeValues: [],
                },
                {
                    name: "WHO MCH program",
                    created: "2017-01-19T11:39:17.267",
                    lastUpdated: "2017-05-16T16:54:20.159",
                    translations: [],
                    createdBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    sharing: {
                        owner: "xE7jOejl9FI",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "WHO MCH program",
                    authorities: [],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "AIK2aQOJIbj",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "FLDWwCTIsv9",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "WHO MCH program",
                    access: {
                        manage: true,
                        externalize: true,
                        write: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    favorite: false,
                    user: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    id: "Pqoy4DLOdMK",
                    attributeValues: [],
                },
            ],
        },
        sixth: {
            userGroups: [
                {
                    name: "_DATASET_Superuser",
                    created: "2021-03-18T11:52:17.426",
                    lastUpdated: "2021-03-18T11:52:39.713",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    displayName: "_DATASET_Superuser",
                    access: {
                        manage: true,
                        externalize: true,
                        write: true,
                        read: true,
                        update: true,
                        delete: true,
                    },
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    id: "B6JNeAQ6akX",
                    attributeValues: [],
                    users: [
                        {
                            id: "TLILGeK5aBx",
                            code: null,
                            name: "Lao Thailand",
                            displayName: "Lao Thailand",
                            username: "lao",
                        },
                        {
                            id: "xNW0W2jO6Ir",
                            code: null,
                            name: "Norwegian Norway",
                            displayName: "Norwegian Norway",
                            username: "norwegian",
                        },
                        {
                            id: "wqFivBzTq3r",
                            code: null,
                            name: "Danish Denmark",
                            displayName: "Danish Denmark",
                            username: "danish",
                        },
                        {
                            id: "tsxW8w0KNe3",
                            code: null,
                            name: "Spanish Spain",
                            displayName: "Spanish Spain",
                            username: "spanish",
                        },
                        {
                            id: "sVahVulbH6q",
                            code: null,
                            name: "Hella Dawit",
                            displayName: "Hella Dawit",
                            username: "hella",
                        },
                        {
                            id: "cddnwKV2gm9",
                            code: null,
                            name: "Donor User",
                            displayName: "Donor User",
                            username: "donor",
                        },
                        {
                            id: "T4AwvxjfaFy",
                            code: null,
                            name: "Burmese Myanmar",
                            displayName: "Burmese Myanmar",
                            username: "burmese",
                        },
                        {
                            id: "xvfpjHAngDE",
                            code: null,
                            name: "Pushto Afghanistan/Pakistan/Iran",
                            displayName: "Pushto Afghanistan/Pakistan/Iran",
                            username: "pushto",
                        },
                        {
                            id: "ittdM3r942E",
                            code: null,
                            name: "Sorani Iraq/Iran",
                            displayName: "Sorani Iraq/Iran",
                            username: "sorani",
                        },
                        {
                            id: "TGffsAIhDjd",
                            code: null,
                            name: "Persian Iran/Afghanistan/Tajikistan",
                            displayName: "Persian Iran/Afghanistan/Tajikistan",
                            username: "persian",
                        },
                        {
                            id: "DdfFqqZkBhd",
                            code: null,
                            name: "ArabicS Sudan",
                            displayName: "ArabicS Sudan",
                            username: "arabics",
                        },
                        {
                            id: "t6ijJxbHBCa",
                            code: null,
                            name: "ChineseC China",
                            displayName: "ChineseC China",
                            username: "chinesec",
                        },
                        {
                            id: "yarlPr6DsOF",
                            code: null,
                            name: "Chinese Asia",
                            displayName: "Chinese Asia",
                            username: "chinese",
                        },
                        {
                            id: "cFWMFtK4PQL",
                            code: null,
                            name: "Mongolian Mongolia",
                            displayName: "Mongolian Mongolia",
                            username: "mongolian",
                        },
                        {
                            id: "oXD88WWSQpR",
                            code: null,
                            name: "Alain Traore",
                            displayName: "Alain Traore",
                            username: "traore",
                        },
                        {
                            id: "wQ1F32Aa9Ug",
                            code: null,
                            name: "Bengali Bangladesh",
                            displayName: "Bengali Bangladesh",
                            username: "bengali",
                        },
                        {
                            id: "IAzIZweJnhm",
                            code: null,
                            name: "Geetha Alwan",
                            displayName: "Geetha Alwan",
                            username: "geetha",
                        },
                        {
                            id: "Ls4RGG9xEAf",
                            code: null,
                            name: "Urdu Pakistan",
                            displayName: "Urdu Pakistan",
                            username: "urdu",
                        },
                        {
                            id: "sY16gfCRrla",
                            code: null,
                            name: "Swedish Sweden",
                            displayName: "Swedish Sweden",
                            username: "swedish",
                        },
                        {
                            id: "NDXCID2HkYy",
                            code: null,
                            name: "Khmer Cambodia",
                            displayName: "Khmer Cambodia",
                            username: "khmer",
                        },
                        {
                            id: "k0pJIVKAJz3",
                            code: null,
                            name: "Gintare Vilkelyte",
                            displayName: "Gintare Vilkelyte",
                            username: "gintare",
                        },
                        {
                            id: "OhBMBATrkP7",
                            code: null,
                            name: "French France",
                            displayName: "French France",
                            username: "french",
                        },
                        {
                            id: "VmcjllruaJh",
                            code: null,
                            name: "Russian Russia",
                            displayName: "Russian Russia",
                            username: "russia",
                        },
                        {
                            id: "iPVcWfursz9",
                            code: null,
                            name: "Philip Larsen Donnelly",
                            displayName: "Philip Larsen Donnelly",
                            username: "phil",
                        },
                        {
                            id: "NO74DaadTdK",
                            code: null,
                            name: "PortugueseB Brazil",
                            displayName: "PortugueseB Brazil",
                            username: "portugueseb",
                        },
                        {
                            id: "A3eEvwGueIH",
                            code: null,
                            name: "Portuguese Portugal",
                            displayName: "Portuguese Portugal",
                            username: "portuguese",
                        },
                        {
                            id: "OF1mSOFpygN",
                            code: null,
                            name: "Arabic UAE",
                            displayName: "Arabic UAE",
                            username: "arabic",
                        },
                        {
                            id: "D6bJvkVFx6R",
                            code: null,
                            name: "Tajik Tajikistan",
                            displayName: "Tajik Tajikistan",
                            username: "tajik",
                        },
                        {
                            id: "I54UvDN8cz8",
                            code: null,
                            name: "Tetum Timor",
                            displayName: "Tetum Timor",
                            username: "tetum",
                        },
                        {
                            id: "ygh8rOt4dIO",
                            code: null,
                            name: "Kinyarwanda Rwanda",
                            displayName: "Kinyarwanda Rwanda",
                            username: "kinyarwanda",
                        },
                        {
                            id: "I9jt9WOztz6",
                            code: null,
                            name: "Ukrainian Ukraine",
                            displayName: "Ukrainian Ukraine",
                            username: "ukrainian",
                        },
                        {
                            id: "NG6JReWSInT",
                            code: null,
                            name: "ArabicI Iraq",
                            displayName: "ArabicI Iraq",
                            username: "arabici",
                        },
                        {
                            id: "FVsLhslRbTK",
                            code: null,
                            name: "ArabicE Egypt",
                            displayName: "ArabicE Egypt",
                            username: "arabice",
                        },
                        {
                            id: "tQSUE8azWFG",
                            code: null,
                            name: "English US/UK",
                            displayName: "English US/UK",
                            username: "english",
                        },
                        {
                            id: "LzGINtooAmK",
                            code: null,
                            name: "Vietnamese Vietnam",
                            displayName: "Vietnamese Vietnam",
                            username: "viertnamese",
                        },
                        {
                            id: "DXyJmlo9rge",
                            code: null,
                            name: "John Barnes",
                            displayName: "John Barnes",
                            username: "android",
                        },
                        {
                            id: "lfRiUQewoOd",
                            code: null,
                            name: "Indonesian Indonesia",
                            displayName: "Indonesian Indonesia",
                            username: "indonesian",
                        },
                        {
                            id: "ihiElEI8kef",
                            code: null,
                            name: "Nepali Nepal",
                            displayName: "Nepali Nepal",
                            username: "nepali",
                        },
                        {
                            id: "awtnYWiVEd5",
                            code: null,
                            name: "Suleimane Diawara",
                            displayName: "Suleimane Diawara",
                            username: "diawara",
                        },
                        {
                            id: "xE7jOejl9FI",
                            code: null,
                            name: "John Traore",
                            displayName: "John Traore",
                            username: "admin",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                            code: null,
                            name: "Haroon Twalibu",
                            displayName: "Haroon Twalibu",
                            username: "haroon",
                        },
                        {
                            id: "JyMUTHHxh3B",
                            code: null,
                            name: "Bislama Vanuatu",
                            displayName: "Bislama Vanuatu",
                            username: "bislama",
                        },
                    ],
                    managedGroups: [],
                    managedByGroups: [],
                },
            ],
        },
        seventh: {
            dataElements: [getDataElementDataSetMetadata()],
        },
        eighth: {
            dataElementGroups: [getDataElementGroupMetadata()],
        },
    } as unknown as Record<ResponseNumber, MetadataPackage>;
}

export function getDataSetTypeExpectedPayload(options: {
    includeObjectsAndReferences: boolean;
    includeOnlyReferences: boolean;
}): SynchronizationPayload {
    const { includeObjectsAndReferences, includeOnlyReferences } = options;

    if (includeObjectsAndReferences) {
        return {
            users: [
                {
                    name: "Tom Wakiki",
                    created: "2012-11-21T12:02:04.303",
                    lastUpdated: "2025-03-28T06:52:23.700",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    sharing: {
                        owner: "system-process",
                        external: false,
                        users: {},
                        userGroups: {},
                    },
                    username: "system",
                    externalAuth: false,
                    passwordLastUpdated: "2021-03-18T11:58:32.094",
                    cogsDimensionConstraints: [],
                    catDimensionConstraints: [],
                    lastLogin: "2025-03-28T06:52:23.700",
                    selfRegistered: false,
                    invitation: false,
                    disabled: false,
                    surname: "Wakiki",
                    firstName: "Tom",
                    phoneNumber: "+233223232",
                    jobTitle: "System Administrator",
                    introduction: "I am the system administrator in Sierra Leone",
                    gender: "gender_male",
                    birthday: "1976-06-03T00:00:00.000",
                    nationality: "Sierra Leone",
                    employer: "Sierra Leone Ministry of Health",
                    education: "System administration",
                    interests: "Computer systems",
                    languages: "English",
                    lastCheckedInterpretations: "2016-10-13T11:41:51.443",
                    organisationUnits: [
                        {
                            id: "ImspTQPwCqd",
                        },
                    ],
                    dataViewOrganisationUnits: [],
                    teiSearchOrganisationUnits: [],
                    twoFactorEnabled: false,
                    userCredentials: {
                        id: "GOLswS44mh8",
                        username: "system",
                        externalAuth: false,
                        twoFA: false,
                        passwordLastUpdated: "2021-03-18T11:58:32.094",
                        cogsDimensionConstraints: [],
                        catDimensionConstraints: [],
                        previousPasswords: [],
                        lastLogin: "2025-03-28T06:52:23.700",
                        selfRegistered: false,
                        invitation: false,
                        disabled: false,
                        access: {
                            manage: true,
                            externalize: true,
                            write: true,
                            read: true,
                            update: true,
                            delete: true,
                        },
                        sharing: {
                            owner: "system-process",
                            external: false,
                            users: {},
                            userGroups: {},
                        },
                        userRoles: [
                            {
                                id: "UYXOT4A7JMI",
                            },
                            {
                                id: "LGWLyWNro4x",
                            },
                        ],
                    },
                    displayName: "Tom Wakiki",
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    id: "GOLswS44mh8",
                    attributeValues: [],
                    userRoles: [
                        {
                            id: "UYXOT4A7JMI",
                        },
                        {
                            id: "LGWLyWNro4x",
                        },
                    ],
                    userGroups: [
                        {
                            id: "M1Qre0247G3",
                        },
                        {
                            id: "pBnkuih0c1K",
                        },
                        {
                            id: "wl5cDMuUhmF",
                        },
                        {
                            id: "qlEhuAA77gc",
                        },
                        {
                            id: "QYrzIjSfI8z",
                        },
                        {
                            id: "lFHP5lLkzVr",
                        },
                        {
                            id: "L4XTzgbdza3",
                        },
                        {
                            id: "jvrEwEJ2yZn",
                        },
                        {
                            id: "vAvEltyXGbD",
                        },
                        {
                            id: "zz6XckBrLlj",
                        },
                    ],
                },
                {
                    name: "Guest User",
                    created: "2014-10-07T22:17:43.562",
                    lastUpdated: "2021-03-18T11:59:01.285",
                    translations: [],
                    favorites: [],
                    sharing: {
                        external: false,
                        users: {},
                        userGroups: {},
                    },
                    username: "guest",
                    externalAuth: false,
                    passwordLastUpdated: "2021-03-18T11:59:01.240",
                    cogsDimensionConstraints: [],
                    catDimensionConstraints: [],
                    lastLogin: "2014-10-07T22:17:43.434",
                    selfRegistered: false,
                    invitation: false,
                    disabled: false,
                    surname: "User",
                    firstName: "Guest",
                    organisationUnits: [
                        {
                            id: "ImspTQPwCqd",
                        },
                    ],
                    dataViewOrganisationUnits: [],
                    teiSearchOrganisationUnits: [],
                    twoFactorEnabled: false,
                    userCredentials: {
                        id: "rWLrZL8rP3K",
                        username: "guest",
                        externalAuth: false,
                        twoFA: false,
                        passwordLastUpdated: "2021-03-18T11:59:01.240",
                        cogsDimensionConstraints: [],
                        catDimensionConstraints: [],
                        previousPasswords: [],
                        lastLogin: "2014-10-07T22:17:43.434",
                        restoreToken: "$2a$10$qdHdJe70XCPHcyqVUnL99OAE8hrOvMpoBGE5aMMdaE89.Q1FgKEym",
                        restoreExpiry: "2014-10-08T00:00:00.000",
                        selfRegistered: false,
                        invitation: false,
                        disabled: false,
                        access: {
                            manage: true,
                            externalize: true,
                            write: true,
                            read: true,
                            update: true,
                            delete: true,
                        },
                        sharing: {
                            external: false,
                            users: {},
                            userGroups: {},
                        },
                        userRoles: [
                            {
                                id: "XS0dNzuZmfH",
                            },
                        ],
                    },
                    displayName: "Guest User",
                    favorite: false,
                    id: "rWLrZL8rP3K",
                    attributeValues: [],
                    userRoles: [
                        {
                            id: "XS0dNzuZmfH",
                        },
                    ],
                    userGroups: [],
                },
                {
                    name: "John Traore",
                    created: "2013-04-18T17:15:08.407",
                    lastUpdated: "2025-03-28T06:48:13.412",
                    translations: [],
                    createdBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    sharing: {
                        external: false,
                        users: {},
                        userGroups: {},
                    },
                    username: "admin",
                    externalAuth: false,
                    passwordLastUpdated: "2014-12-18T20:56:05.264",
                    cogsDimensionConstraints: [],
                    catDimensionConstraints: [],
                    lastLogin: "2025-03-28T06:48:13.412",
                    selfRegistered: false,
                    invitation: false,
                    disabled: false,
                    surname: "Traore",
                    firstName: "John",
                    email: "dummy@dhis2.org",
                    jobTitle: "Super user",
                    introduction: "I am the super user of DHIS 2",
                    gender: "gender_male",
                    birthday: "1971-04-08T00:00:00.000",
                    nationality: "Sierra Leone",
                    employer: "DHIS",
                    education: "Master of super using",
                    interests: "Football, swimming, singing, dancing",
                    languages: "English",
                    lastCheckedInterpretations: "2025-03-28T04:56:49.883",
                    whatsApp: "+123123123123",
                    facebookMessenger: "john.traore",
                    skype: "john.traore",
                    telegram: "john.traore",
                    twitter: "john.traore",
                    organisationUnits: [
                        {
                            id: "ImspTQPwCqd",
                        },
                    ],
                    dataViewOrganisationUnits: [],
                    teiSearchOrganisationUnits: [],
                    twoFactorEnabled: false,
                    userCredentials: {
                        id: "xE7jOejl9FI",
                        username: "admin",
                        externalAuth: false,
                        twoFA: false,
                        passwordLastUpdated: "2014-12-18T20:56:05.264",
                        cogsDimensionConstraints: [],
                        catDimensionConstraints: [],
                        previousPasswords: [],
                        lastLogin: "2025-03-28T06:48:13.412",
                        selfRegistered: false,
                        invitation: false,
                        disabled: false,
                        access: {
                            manage: true,
                            externalize: true,
                            write: true,
                            read: true,
                            update: true,
                            delete: true,
                        },
                        sharing: {
                            external: false,
                            users: {},
                            userGroups: {},
                        },
                        userRoles: [
                            {
                                id: "UYXOT4A7JMI",
                            },
                            {
                                id: "Ufph3mGRmMo",
                            },
                            {
                                id: "Euq3XfEIEbx",
                            },
                            {
                                id: "aNk5AyC7ydy",
                            },
                            {
                                id: "cUlTcejWree",
                            },
                            {
                                id: "TMK9CMZ2V98",
                            },
                            {
                                id: "Ql6Gew7eaX6",
                            },
                            {
                                id: "Pqoy4DLOdMK",
                            },
                            {
                                id: "DRdaVRtwmG5",
                            },
                            {
                                id: "jRWSNIHdKww",
                            },
                            {
                                id: "txB7vu1w2Pr",
                            },
                            {
                                id: "XS0dNzuZmfH",
                            },
                            {
                                id: "xJZBzAHI88H",
                            },
                        ],
                    },
                    displayName: "John Traore",
                    favorite: false,
                    user: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    id: "xE7jOejl9FI",
                    attributeValues: [],
                    userRoles: [
                        {
                            id: "UYXOT4A7JMI",
                        },
                        {
                            id: "Ufph3mGRmMo",
                        },
                        {
                            id: "Euq3XfEIEbx",
                        },
                        {
                            id: "aNk5AyC7ydy",
                        },
                        {
                            id: "cUlTcejWree",
                        },
                        {
                            id: "TMK9CMZ2V98",
                        },
                        {
                            id: "Ql6Gew7eaX6",
                        },
                        {
                            id: "Pqoy4DLOdMK",
                        },
                        {
                            id: "DRdaVRtwmG5",
                        },
                        {
                            id: "jRWSNIHdKww",
                        },
                        {
                            id: "txB7vu1w2Pr",
                        },
                        {
                            id: "XS0dNzuZmfH",
                        },
                        {
                            id: "xJZBzAHI88H",
                        },
                    ],
                    userGroups: [
                        {
                            id: "Kk12LkEWtXp",
                        },
                        {
                            id: "M1Qre0247G3",
                        },
                        {
                            id: "NTC8GjJ7p8P",
                        },
                        {
                            id: "B6JNeAQ6akX",
                        },
                        {
                            id: "wl5cDMuUhmF",
                        },
                        {
                            id: "QYrzIjSfI8z",
                        },
                        {
                            id: "lFHP5lLkzVr",
                        },
                        {
                            id: "jvrEwEJ2yZn",
                        },
                        {
                            id: "vAvEltyXGbD",
                        },
                        {
                            id: "w900PX10L7O",
                        },
                        {
                            id: "GogLpGmkL0g",
                        },
                        {
                            id: "vRoAruMnNpB",
                        },
                        {
                            id: "z1gNAf2zUxZ",
                        },
                        {
                            id: "gXpmQO6eEOo",
                        },
                        {
                            id: "tH0GcNZZ1vW",
                        },
                        {
                            id: "H9XnHoWRKCg",
                        },
                    ],
                },
            ],
            userGroups: [
                {
                    name: "_DATASET_Superuser",
                    created: "2021-03-18T11:52:17.426",
                    lastUpdated: "2021-03-18T11:52:39.713",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    displayName: "_DATASET_Superuser",
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    id: "B6JNeAQ6akX",
                    attributeValues: [],
                    users: [
                        {
                            id: "TLILGeK5aBx",
                            code: null,
                            name: "Lao Thailand",
                            displayName: "Lao Thailand",
                            username: "lao",
                        },
                        {
                            id: "xNW0W2jO6Ir",
                            code: null,
                            name: "Norwegian Norway",
                            displayName: "Norwegian Norway",
                            username: "norwegian",
                        },
                        {
                            id: "wqFivBzTq3r",
                            code: null,
                            name: "Danish Denmark",
                            displayName: "Danish Denmark",
                            username: "danish",
                        },
                        {
                            id: "tsxW8w0KNe3",
                            code: null,
                            name: "Spanish Spain",
                            displayName: "Spanish Spain",
                            username: "spanish",
                        },
                        {
                            id: "sVahVulbH6q",
                            code: null,
                            name: "Hella Dawit",
                            displayName: "Hella Dawit",
                            username: "hella",
                        },
                        {
                            id: "cddnwKV2gm9",
                            code: null,
                            name: "Donor User",
                            displayName: "Donor User",
                            username: "donor",
                        },
                        {
                            id: "T4AwvxjfaFy",
                            code: null,
                            name: "Burmese Myanmar",
                            displayName: "Burmese Myanmar",
                            username: "burmese",
                        },
                        {
                            id: "xvfpjHAngDE",
                            code: null,
                            name: "Pushto Afghanistan/Pakistan/Iran",
                            displayName: "Pushto Afghanistan/Pakistan/Iran",
                            username: "pushto",
                        },
                        {
                            id: "ittdM3r942E",
                            code: null,
                            name: "Sorani Iraq/Iran",
                            displayName: "Sorani Iraq/Iran",
                            username: "sorani",
                        },
                        {
                            id: "TGffsAIhDjd",
                            code: null,
                            name: "Persian Iran/Afghanistan/Tajikistan",
                            displayName: "Persian Iran/Afghanistan/Tajikistan",
                            username: "persian",
                        },
                        {
                            id: "DdfFqqZkBhd",
                            code: null,
                            name: "ArabicS Sudan",
                            displayName: "ArabicS Sudan",
                            username: "arabics",
                        },
                        {
                            id: "t6ijJxbHBCa",
                            code: null,
                            name: "ChineseC China",
                            displayName: "ChineseC China",
                            username: "chinesec",
                        },
                        {
                            id: "yarlPr6DsOF",
                            code: null,
                            name: "Chinese Asia",
                            displayName: "Chinese Asia",
                            username: "chinese",
                        },
                        {
                            id: "cFWMFtK4PQL",
                            code: null,
                            name: "Mongolian Mongolia",
                            displayName: "Mongolian Mongolia",
                            username: "mongolian",
                        },
                        {
                            id: "oXD88WWSQpR",
                            code: null,
                            name: "Alain Traore",
                            displayName: "Alain Traore",
                            username: "traore",
                        },
                        {
                            id: "wQ1F32Aa9Ug",
                            code: null,
                            name: "Bengali Bangladesh",
                            displayName: "Bengali Bangladesh",
                            username: "bengali",
                        },
                        {
                            id: "IAzIZweJnhm",
                            code: null,
                            name: "Geetha Alwan",
                            displayName: "Geetha Alwan",
                            username: "geetha",
                        },
                        {
                            id: "Ls4RGG9xEAf",
                            code: null,
                            name: "Urdu Pakistan",
                            displayName: "Urdu Pakistan",
                            username: "urdu",
                        },
                        {
                            id: "sY16gfCRrla",
                            code: null,
                            name: "Swedish Sweden",
                            displayName: "Swedish Sweden",
                            username: "swedish",
                        },
                        {
                            id: "NDXCID2HkYy",
                            code: null,
                            name: "Khmer Cambodia",
                            displayName: "Khmer Cambodia",
                            username: "khmer",
                        },
                        {
                            id: "k0pJIVKAJz3",
                            code: null,
                            name: "Gintare Vilkelyte",
                            displayName: "Gintare Vilkelyte",
                            username: "gintare",
                        },
                        {
                            id: "OhBMBATrkP7",
                            code: null,
                            name: "French France",
                            displayName: "French France",
                            username: "french",
                        },
                        {
                            id: "VmcjllruaJh",
                            code: null,
                            name: "Russian Russia",
                            displayName: "Russian Russia",
                            username: "russia",
                        },
                        {
                            id: "iPVcWfursz9",
                            code: null,
                            name: "Philip Larsen Donnelly",
                            displayName: "Philip Larsen Donnelly",
                            username: "phil",
                        },
                        {
                            id: "NO74DaadTdK",
                            code: null,
                            name: "PortugueseB Brazil",
                            displayName: "PortugueseB Brazil",
                            username: "portugueseb",
                        },
                        {
                            id: "A3eEvwGueIH",
                            code: null,
                            name: "Portuguese Portugal",
                            displayName: "Portuguese Portugal",
                            username: "portuguese",
                        },
                        {
                            id: "OF1mSOFpygN",
                            code: null,
                            name: "Arabic UAE",
                            displayName: "Arabic UAE",
                            username: "arabic",
                        },
                        {
                            id: "D6bJvkVFx6R",
                            code: null,
                            name: "Tajik Tajikistan",
                            displayName: "Tajik Tajikistan",
                            username: "tajik",
                        },
                        {
                            id: "I54UvDN8cz8",
                            code: null,
                            name: "Tetum Timor",
                            displayName: "Tetum Timor",
                            username: "tetum",
                        },
                        {
                            id: "ygh8rOt4dIO",
                            code: null,
                            name: "Kinyarwanda Rwanda",
                            displayName: "Kinyarwanda Rwanda",
                            username: "kinyarwanda",
                        },
                        {
                            id: "I9jt9WOztz6",
                            code: null,
                            name: "Ukrainian Ukraine",
                            displayName: "Ukrainian Ukraine",
                            username: "ukrainian",
                        },
                        {
                            id: "NG6JReWSInT",
                            code: null,
                            name: "ArabicI Iraq",
                            displayName: "ArabicI Iraq",
                            username: "arabici",
                        },
                        {
                            id: "FVsLhslRbTK",
                            code: null,
                            name: "ArabicE Egypt",
                            displayName: "ArabicE Egypt",
                            username: "arabice",
                        },
                        {
                            id: "tQSUE8azWFG",
                            code: null,
                            name: "English US/UK",
                            displayName: "English US/UK",
                            username: "english",
                        },
                        {
                            id: "LzGINtooAmK",
                            code: null,
                            name: "Vietnamese Vietnam",
                            displayName: "Vietnamese Vietnam",
                            username: "viertnamese",
                        },
                        {
                            id: "DXyJmlo9rge",
                            code: null,
                            name: "John Barnes",
                            displayName: "John Barnes",
                            username: "android",
                        },
                        {
                            id: "lfRiUQewoOd",
                            code: null,
                            name: "Indonesian Indonesia",
                            displayName: "Indonesian Indonesia",
                            username: "indonesian",
                        },
                        {
                            id: "ihiElEI8kef",
                            code: null,
                            name: "Nepali Nepal",
                            displayName: "Nepali Nepal",
                            username: "nepali",
                        },
                        {
                            id: "awtnYWiVEd5",
                            code: null,
                            name: "Suleimane Diawara",
                            displayName: "Suleimane Diawara",
                            username: "diawara",
                        },
                        {
                            id: "xE7jOejl9FI",
                            code: null,
                            name: "John Traore",
                            displayName: "John Traore",
                            username: "admin",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                            code: null,
                            name: "Haroon Twalibu",
                            displayName: "Haroon Twalibu",
                            username: "haroon",
                        },
                        {
                            id: "JyMUTHHxh3B",
                            code: null,
                            name: "Bislama Vanuatu",
                            displayName: "Bislama Vanuatu",
                            username: "bislama",
                        },
                    ],
                    managedGroups: [],
                    managedByGroups: [],
                },
            ],
            userRoles: [
                {
                    name: "Antenatal care program",
                    created: "2016-04-05T23:54:04.405",
                    lastUpdated: "2017-01-19T11:39:39.906",
                    translations: [],
                    createdBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    favorites: [],
                    sharing: {
                        owner: "xE7jOejl9FI",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "Access to the antenatal care program",
                    authorities: [],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "wqFivBzTq3r",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "T4AwvxjfaFy",
                        },
                        {
                            id: "xvfpjHAngDE",
                        },
                        {
                            id: "TGffsAIhDjd",
                        },
                        {
                            id: "DdfFqqZkBhd",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "t6ijJxbHBCa",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "AIK2aQOJIbj",
                        },
                        {
                            id: "wQ1F32Aa9Ug",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "Ls4RGG9xEAf",
                        },
                        {
                            id: "sY16gfCRrla",
                        },
                        {
                            id: "NDXCID2HkYy",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "k0pJIVKAJz3",
                        },
                        {
                            id: "OhBMBATrkP7",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "NO74DaadTdK",
                        },
                        {
                            id: "OF1mSOFpygN",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "LzGINtooAmK",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "JyMUTHHxh3B",
                        },
                        {
                            id: "TLILGeK5aBx",
                        },
                        {
                            id: "xNW0W2jO6Ir",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "tsxW8w0KNe3",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "ittdM3r942E",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "yarlPr6DsOF",
                        },
                        {
                            id: "cFWMFtK4PQL",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "GOLswS44mh8",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "VmcjllruaJh",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "A3eEvwGueIH",
                        },
                        {
                            id: "D6bJvkVFx6R",
                        },
                        {
                            id: "I54UvDN8cz8",
                        },
                        {
                            id: "FLDWwCTIsv9",
                        },
                        {
                            id: "ygh8rOt4dIO",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "I9jt9WOztz6",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "NG6JReWSInT",
                        },
                        {
                            id: "FVsLhslRbTK",
                        },
                        {
                            id: "tQSUE8azWFG",
                        },
                        {
                            id: "lfRiUQewoOd",
                        },
                        {
                            id: "ihiElEI8kef",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "Antenatal care program",
                    favorite: false,
                    user: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    id: "UYXOT4A7JMI",
                    attributeValues: [],
                },
                {
                    name: "System administrator (ALL)",
                    created: "2012-08-02T16:53:37.078",
                    lastUpdated: "2017-05-16T16:53:52.045",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "System administrator",
                    authorities: ["ALL"],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "wqFivBzTq3r",
                        },
                        {
                            id: "T4AwvxjfaFy",
                        },
                        {
                            id: "xvfpjHAngDE",
                        },
                        {
                            id: "TGffsAIhDjd",
                        },
                        {
                            id: "DdfFqqZkBhd",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "t6ijJxbHBCa",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "wQ1F32Aa9Ug",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "Ls4RGG9xEAf",
                        },
                        {
                            id: "sY16gfCRrla",
                        },
                        {
                            id: "NDXCID2HkYy",
                        },
                        {
                            id: "k0pJIVKAJz3",
                        },
                        {
                            id: "OhBMBATrkP7",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "NO74DaadTdK",
                        },
                        {
                            id: "OF1mSOFpygN",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "LzGINtooAmK",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "JyMUTHHxh3B",
                        },
                        {
                            id: "TLILGeK5aBx",
                        },
                        {
                            id: "xNW0W2jO6Ir",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "tsxW8w0KNe3",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "ittdM3r942E",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "yarlPr6DsOF",
                        },
                        {
                            id: "cFWMFtK4PQL",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "GOLswS44mh8",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "VmcjllruaJh",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "A3eEvwGueIH",
                        },
                        {
                            id: "D6bJvkVFx6R",
                        },
                        {
                            id: "I54UvDN8cz8",
                        },
                        {
                            id: "ygh8rOt4dIO",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "I9jt9WOztz6",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "NG6JReWSInT",
                        },
                        {
                            id: "FVsLhslRbTK",
                        },
                        {
                            id: "tQSUE8azWFG",
                        },
                        {
                            id: "lfRiUQewoOd",
                        },
                        {
                            id: "ihiElEI8kef",
                        },
                    ],
                    displayName: "System administrator (ALL)",
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    id: "LGWLyWNro4x",
                    attributeValues: [],
                },
                {
                    name: "Guest",
                    created: "2018-12-03T12:45:51.857",
                    lastUpdated: "2018-12-03T12:45:51.857",
                    translations: [],
                    createdBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    sharing: {
                        owner: "xE7jOejl9FI",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "Read-only",
                    authorities: [
                        "M_dhis-web-light",
                        "M_dhis-web-interpretation",
                        "M_dhis-web-pivot",
                        "M_dhis-web-mobile",
                        "M_dhis-web-messaging",
                        "M_dhis-web-data-visualizer",
                        "M_dhis-web-mapping",
                        "M_dhis-web-dashboard",
                        "M_dhis-web-visualizer",
                        "M_dhis-web-maps",
                    ],
                    restrictions: [],
                    displayName: "Guest",
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "gEnZri18JsV",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "qDNQJROsrzY",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "N3PZBUlN8vq",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "rWLrZL8rP3K",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "EZtxytGsq8F",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    favorite: false,
                    user: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    id: "XS0dNzuZmfH",
                    attributeValues: [],
                },
                {
                    name: "Child Health Program Manager",
                    created: "2015-01-08T11:57:27.022",
                    lastUpdated: "2015-01-20T11:48:11.005",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "Child Health Program Manager",
                    authorities: [],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "Child Health Program Manager",
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    id: "Ql6Gew7eaX6",
                    attributeValues: [],
                },
                {
                    name: "Child Health Tracker",
                    created: "2013-04-09T21:47:59.640",
                    lastUpdated: "2015-10-20T12:07:20.872",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "Access to the child health program in tracker",
                    authorities: [],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "N3PZBUlN8vq",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "AIK2aQOJIbj",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "FLDWwCTIsv9",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "Child Health Tracker",
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    id: "TMK9CMZ2V98",
                    attributeValues: [],
                },
                {
                    name: "Data entry clerk",
                    created: "2012-11-13T15:56:57.955",
                    lastUpdated: "2022-10-19T11:17:02.298",
                    translations: [],
                    createdBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    sharing: {
                        owner: "xE7jOejl9FI",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "Data entry clerk",
                    authorities: [
                        "M_dhis-web-aggregate-data-entry",
                        "M_dhis-web-dataentry",
                        "M_dhis-web-dashboard",
                        "F_DATAVALUE_ADD",
                        "M_dhis-web-maps",
                    ],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "AIK2aQOJIbj",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "PhzytPW3g2J",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "DXyJmlo9rge",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "N3PZBUlN8vq",
                        },
                        {
                            id: "ObaborECU7w",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "FLDWwCTIsv9",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "Data entry clerk",
                    favorite: false,
                    user: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    id: "Euq3XfEIEbx",
                    attributeValues: [],
                },
                {
                    name: "Facility tracker",
                    created: "2012-11-20T22:07:53.822",
                    lastUpdated: "2018-02-19T14:47:44.781",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "Tracker user at the facility",
                    authorities: [
                        "F_PROGRAM_INDICATOR_PUBLIC_ADD",
                        "F_RELATIONSHIP_ADD",
                        "F_SCHEDULING_SEND_MESSAGE",
                        "M_dhis-web-pivot",
                        "F_PROGRAM_TRACKING_SEARCH",
                        "F_RELATIONSHIP_MANAGEMENT",
                        "F_ANONYMOUS_DATA_ENTRY",
                        "F_GENERATE_BENEFICIARY_TABULAR_REPORT",
                        "F_SCHEDULING_ADMIN",
                        "M_dhis-web-caseentry",
                        "M_dhis-web-light",
                        "F_TRACKED_ENTITY_COMMENT_DELETE",
                        "F_SINGLE_EVENT_DATA_ENTRY",
                        "F_GENERATE_STATISTICAL_PROGRAM_REPORT",
                        "M_dhis-web-tracker-capture",
                        "M_dhis-web-event-capture",
                        "F_TRACKED_ENTITY_COMMENT_ADD",
                        "M_dhis-web-sms",
                        "F_TRACKED_ENTITY_INSTANCE_MANAGEMENT",
                        "F_PROGRAM_INSTANCE_MANAGEMENT",
                        "M_dhis-web-visualizer",
                        "M_dhis-web-maps",
                        "F_TRACKED_ENTITY_INSTANCE_LIST",
                        "M_dhis-web-mobile",
                        "F_PROGRAM_TRACKING_LIST",
                        "F_ACTIVITY_PLAN",
                        "M_dhis-web-data-visualizer",
                        "F_PROGRAM_INSTANCE_DELETE",
                        "M_dhis-web-dashboard",
                        "F_TRACKED_ENTITY_INSTANCE_HISTORY",
                        "F_PROGRAM_STAGE_INSTANCE_DELETE",
                        "F_TRACKED_ENTITY_INSTANCE_CHANGE_LOCATION",
                        "M_dhis-web-scheduler",
                        "M_dhis-web-capture",
                        "F_PROGRAM_TRACKING_MANAGEMENT",
                        "F_GENERATE_PROGRAM_SUMMARY_REPORT",
                        "F_MOBILE_SENDSMS",
                        "F_NAME_BASED_DATA_ENTRY",
                        "F_RELATIONSHIP_DELETE",
                        "M_dhis-web-mapping",
                        "F_TRACKED_ENTITY_INSTANCE_DASHBOARD",
                        "F_PROGRAM_STAGE_INSTANCE_SEARCH",
                    ],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "AIK2aQOJIbj",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "PhzytPW3g2J",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "FLDWwCTIsv9",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "DXyJmlo9rge",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "Facility tracker",
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    id: "txB7vu1w2Pr",
                    attributeValues: [],
                },
                {
                    name: "Inpatient program",
                    created: "2013-04-09T21:47:12.114",
                    lastUpdated: "2014-11-20T15:57:19.613",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "Access to the inpatient program in tracker",
                    authorities: [],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "AIK2aQOJIbj",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "FLDWwCTIsv9",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "DXyJmlo9rge",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "Inpatient program",
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    id: "DRdaVRtwmG5",
                    attributeValues: [],
                },
                {
                    name: "M and E Officer",
                    created: "2018-12-03T12:45:35.034",
                    lastUpdated: "2025-03-26T15:49:48.410",
                    translations: [],
                    createdBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    sharing: {
                        owner: "xE7jOejl9FI",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "M and E Officer",
                    authorities: [
                        "M_dhis-web-interpretation",
                        "F_USER_VIEW",
                        "F_VALIDATIONRULE_PUBLIC_ADD",
                        "F_SCHEDULING_ADMIN",
                        "M_linelisting",
                        "M_dhis-web-event-capture",
                        "M_dhis-web-sms",
                        "F_DATAVALUE_ADD",
                        "F_INSERT_CUSTOM_JS_CSS",
                        "M_dhis-web-visualizer",
                        "M_dhis-web-event-reports",
                        "F_VIEW_UNAPPROVED_DATA",
                        "M_dhis-web-mobile",
                        "F_ACTIVITY_PLAN",
                        "F_INDICATOR_PRIVATE_ADD",
                        "M_dhis-web-cache-cleaner",
                        "M_dhis-web-event-visualizer",
                        "F_ACCESS_TRACKED_ENTITY_ATTRIBUTES",
                        "F_USER_ADD",
                        "F_DOCUMENT_PRIVATE_ADD",
                        "F_APPROVE_DATA_LOWER_LEVELS",
                        "M_dhis-web-datastore",
                        "M_dhis-web-data-quality",
                        "F_REPORT_PUBLIC_ADD",
                        "M_dhis-web-dataentry",
                        "M_dhis-web-pivot",
                        "M_dhis-web-usage-analytics",
                        "M_dhis-web-validationrule",
                        "M_dhis-web-caseentry",
                        "M_dhis-web-light",
                        "M_dhis-web-importexport",
                        "M_dhis-web-settings",
                        "F_VIEW_DATABROWSER",
                        "M_dhis-web-tracker-capture",
                        "F_DATASET_PUBLIC_ADD",
                        "F_USER_DELETE",
                        "F_SEND_MESSAGE",
                        "M_dhis-web-maps",
                        "M_dhis-web-maintenance-user",
                        "M_dhis-web-maintenance-appmanager",
                        "M_dhis-web-reporting",
                        "M_dhis-web-maintenance-settings",
                        "M_dhis-web-data-visualizer",
                        "M_dhis-web-maintenance-datadictionary",
                        "M_dhis-web-dashboard",
                        "F_DATASET_DELETE",
                        "F_ACCEPT_DATA_LOWER_LEVELS",
                        "F_APPROVE_DATA",
                        "M_dhis-web-scheduler",
                        "M_dhis-web-capture",
                        "M_dhis-web-messaging",
                        "M_dhis-web-mapping",
                    ],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "IC1o0DI2iWu",
                        },
                        {
                            id: "L2B791gfbds",
                        },
                        {
                            id: "yI9qQfuM7Xd",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "CotVI2NX0rI",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "rH2032EPFvr",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "SpuKahMLsAr",
                        },
                        {
                            id: "nTR8wpj581i",
                        },
                        {
                            id: "ThTAClUCwgA",
                        },
                        {
                            id: "jbPricQDF8n",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "cgRLEcDKUpZ",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "HrP0i2FzUnR",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "ga5Y0Wg5kof",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "DLjZWMsVsq2",
                        },
                        {
                            id: "QqvaU7JjkUV",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "nFNQNgrbTED",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "ppnpAn26Oa8",
                        },
                        {
                            id: "Kh68cDMwZsg",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "cn4PwMeVOaN",
                        },
                        {
                            id: "FGRIfGf342V",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "Z0Gq4MesQBY",
                        },
                        {
                            id: "DXyJmlo9rge",
                        },
                        {
                            id: "I9fMsY4pRKk",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "zEag1whWJ3B",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "Veu64cIQChe",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "Rq9TNYOyS6a",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "ShrDpIA8nQg",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "FfQ2460chiA",
                        },
                        {
                            id: "Onf73mPD6sL",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "cmqG3zxcsCu",
                        },
                        {
                            id: "UgDpalMTGDr",
                        },
                        {
                            id: "G2ysGXpcZWr",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "yppgnhxP8Pa",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "WYDN4b4yRlg",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "SJIZXODVs1o",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "yeaqurD8gyd",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "OYLGMiazHtW",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EGwENMFCpbm",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "NOOF56dveaZ",
                        },
                        {
                            id: "Gb8nYT2iJsj",
                        },
                        {
                            id: "y0yJvbxD6Fx",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "M and E Officer",
                    favorite: false,
                    user: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    id: "jRWSNIHdKww",
                    attributeValues: [],
                },
                {
                    name: "MNCH / PNC (Adult Woman) program",
                    created: "2013-04-09T21:47:42.091",
                    lastUpdated: "2016-06-28T11:08:58.716",
                    translations: [],
                    createdBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    favorites: [],
                    sharing: {
                        owner: "xE7jOejl9FI",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "Access to the MNCH program in tracker",
                    authorities: [],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "AIK2aQOJIbj",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "FLDWwCTIsv9",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "MNCH / PNC (Adult Woman) program",
                    favorite: false,
                    user: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    id: "aNk5AyC7ydy",
                    attributeValues: [],
                },
                {
                    name: "Superuser",
                    created: "2019-04-25T14:22:00.262",
                    lastUpdated: "2025-03-26T15:50:27.048",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "Superuser",
                    authorities: [
                        "F_PROGRAM_INDICATOR_PUBLIC_ADD",
                        "F_USER_VIEW",
                        "F_GENERATE_MIN_MAX_VALUES",
                        "F_VALIDATIONRULE_PUBLIC_ADD",
                        "F_CATEGORY_PRIVATE_ADD",
                        "F_INDICATORGROUPSET_PUBLIC_ADD",
                        "F_EXTERNAL_MAP_LAYER_PRIVATE_ADD",
                        "F_RELATIONSHIPTYPE_DELETE",
                        "F_CATEGORY_OPTION_PRIVATE_ADD",
                        "F_CATEGORY_OPTION_GROUP_PUBLIC_ADD",
                        "M_linelisting",
                        "F_SEND_EMAIL",
                        "M_dhis-web-aggregate-data-entry",
                        "F_ORGUNITGROUPSET_PRIVATE_ADD",
                        "F_INDICATOR_DELETE",
                        "M_dhis-web-event-reports",
                        "F_VIEW_UNAPPROVED_DATA",
                        "F_USERGROUP_MANAGING_RELATIONSHIPS_VIEW",
                        "F_OPTIONGROUPSET_DELETE",
                        "F_USERGROUP_PUBLIC_ADD",
                        "F_PROGRAM_INDICATOR_GROUP_PRIVATE_ADD",
                        "F_DOCUMENT_EXTERNAL",
                        "F_TRACKED_ENTITY_ATTRIBUTE_PUBLIC_ADD",
                        "F_PROGRAM_INDICATOR_DELETE",
                        "F_MOBILE_SENDSMS",
                        "F_TRACKED_ENTITY_ADD",
                        "F_VALIDATIONRULEGROUP_PUBLIC_ADD",
                        "F_REPORT_EXTERNAL",
                        "F_DOCUMENT_PRIVATE_ADD",
                        "M_dhis-web-reports",
                        "F_TRACKED_ENTITY_DELETE",
                        "F_USERGROUP_DELETE",
                        "F_PROGRAM_PRIVATE_ADD",
                        "F_CATEGORY_COMBO_PRIVATE_ADD",
                        "F_EXTERNAL_MAP_LAYER_PUBLIC_ADD",
                        "F_PROGRAM_INDICATOR_GROUP_DELETE",
                        "F_ORGANISATIONUNIT_MOVE",
                        "M_dhis-web-usage-analytics",
                        "F_INDICATORGROUP_DELETE",
                        "F_ORGANISATIONUNIT_DELETE",
                        "F_PROGRAM_RULE_ADD",
                        "F_OPTIONGROUPSET_PRIVATE_ADD",
                        "F_DATASET_PUBLIC_ADD",
                        "F_CATEGORY_COMBO_DELETE",
                        "F_SECTION_DELETE",
                        "F_USER_DELETE",
                        "F_INDICATORGROUPSET_PRIVATE_ADD",
                        "F_PROGRAM_INDICATOR_PRIVATE_ADD",
                        "F_METADATA_IMPORT",
                        "F_EXPORT_EVENTS",
                        "F_SQLVIEW_PUBLIC_ADD",
                        "F_PERFORM_MAINTENANCE",
                        "F_METADATA_EXPORT",
                        "F_MINMAX_DATAELEMENT_ADD",
                        "F_DATAELEMENTGROUP_PRIVATE_ADD",
                        "F_VALIDATIONRULE_PRIVATE_ADD",
                        "F_APPROVE_DATA",
                        "F_DATAELEMENT_PRIVATE_ADD",
                        "F_TRACKED_ENTITY_INSTANCE_SEARCH_IN_ALL_ORGUNITS",
                        "F_IGNORE_TRACKER_REQUIRED_VALUE_VALIDATION",
                        "F_PROGRAM_PUBLIC_ADD",
                        "F_CATEGORY_OPTION_GROUP_SET_PRIVATE_ADD",
                        "F_CATEGORY_OPTION_GROUP_SET_DELETE",
                        "F_USER_ADD_WITHIN_MANAGED_GROUP",
                        "F_ORGANISATIONUNIT_ADD",
                        "M_dhis-web-user",
                        "F_LEGEND_SET_PUBLIC_ADD",
                        "F_CONSTANT_ADD",
                        "F_PREDICTORGROUP_DELETE",
                        "F_INDICATOR_PUBLIC_ADD",
                        "F_INDICATORGROUP_PUBLIC_ADD",
                        "F_TRACKED_ENTITY_ATTRIBUTE_PRIVATE_ADD",
                        "M_dhis-web-maintenance",
                        "M_dhis-web-approval",
                        "F_PROGRAM_RULE_MANAGEMENT",
                        "F_TEI_CASCADE_DELETE",
                        "F_VISUALIZATION_EXTERNAL",
                        "M_dhis-web-cache-cleaner",
                        "F_EDIT_EXPIRED",
                        "F_PROGRAM_DASHBOARD_CONFIG_ADMIN",
                        "F_EVENT_VISUALIZATION_EXTERNAL",
                        "F_ORGANISATIONUNITLEVEL_UPDATE",
                        "F_CATEGORY_OPTION_PUBLIC_ADD",
                        "M_dhis-web-datastore",
                        "F_CATEGORY_OPTION_DELETE",
                        "M_dhis-web-menu-management",
                        "F_REPORT_PUBLIC_ADD",
                        "F_VALIDATIONRULEGROUP_DELETE",
                        "F_OPTIONSET_PRIVATE_ADD",
                        "F_PROGRAM_RULE_DELETE",
                        "F_ORGUNITGROUP_DELETE",
                        "F_DATAELEMENTGROUPSET_PRIVATE_ADD",
                        "M_dhis-web-tracker-capture",
                        "F_LOCALE_ADD",
                        "F_CATEGORY_OPTION_GROUP_PRIVATE_ADD",
                        "F_CATEGORY_PUBLIC_ADD",
                        "F_SECTION_ADD",
                        "F_CATEGORY_COMBO_PUBLIC_ADD",
                        "F_DATASET_DELETE",
                        "F_INDICATORGROUPSET_DELETE",
                        "F_USER_DELETE_WITHIN_MANAGED_GROUP",
                        "M_dhis-web-scheduler",
                        "F_OPTIONGROUP_PUBLIC_ADD",
                        "F_USERROLE_PRIVATE_ADD",
                        "M_dhis-web-messaging",
                        "F_MAP_EXTERNAL",
                        "F_VIEW_SERVER_INFO",
                        "F_DATAELEMENTGROUPSET_PUBLIC_ADD",
                        "F_DATAELEMENTGROUP_DELETE",
                        "F_USERGROUP_MANAGING_RELATIONSHIPS_ADD",
                        "F_ORGUNITGROUP_PRIVATE_ADD",
                        "F_DATAELEMENTGROUP_PUBLIC_ADD",
                        "F_USER_GROUPS_READ_ONLY_ADD_MEMBERS",
                        "F_PREDICTOR_RUN",
                        "F_DATAELEMENT_DELETE",
                        "F_OPTIONGROUP_DELETE",
                        "F_LEGEND_SET_PRIVATE_ADD",
                        "F_PROGRAMSTAGE_DELETE",
                        "F_ATTRIBUTE_PUBLIC_ADD",
                        "F_USERROLE_DELETE",
                        "F_DOCUMENT_DELETE",
                        "F_ORGUNITGROUPSET_DELETE",
                        "M_dhis-web-translations",
                        "F_PROGRAM_DELETE",
                        "F_VALIDATIONRULE_DELETE",
                        "F_DATA_APPROVAL_LEVEL",
                        "F_RELATIONSHIPTYPE_PUBLIC_ADD",
                        "F_PREDICTOR_ADD",
                        "F_SQLVIEW_PRIVATE_ADD",
                        "F_EXPORT_DATA",
                        "F_OAUTH2_CLIENT_MANAGE",
                        "F_EVENT_VISUALIZATION_PUBLIC_ADD",
                        "F_ORGUNITGROUP_PUBLIC_ADD",
                        "F_APPROVE_DATA_LOWER_LEVELS",
                        "F_OPTIONSET_PUBLIC_ADD",
                        "F_EVENTCHART_EXTERNAL",
                        "M_dhis-web-dataentry",
                        "M_dhis-web-import-export",
                        "F_USERROLE_PUBLIC_ADD",
                        "F_ORGUNITGROUPSET_PUBLIC_ADD",
                        "F_SQLVIEW_EXTERNAL",
                        "F_REPORT_DELETE",
                        "F_DASHBOARD_PUBLIC_ADD",
                        "F_CONSTANT_DELETE",
                        "F_PREDICTOR_DELETE",
                        "M_dhis-web-data-visualizer",
                        "F_DATASET_PRIVATE_ADD",
                        "F_EVENTREPORT_PUBLIC_ADD",
                        "F_TRACKED_ENTITY_UPDATE",
                        "F_CATEGORY_OPTION_GROUP_SET_PUBLIC_ADD",
                        "F_METADATA_MANAGE",
                        "F_ANALYTICSTABLEHOOK_DELETE",
                        "F_UNCOMPLETE_EVENT",
                        "M_dhis-web-sms-configuration",
                        "M_dhis-web-interpretation",
                        "F_MAP_PUBLIC_ADD",
                        "F_SCHEDULING_ADMIN",
                        "F_PREDICTORGROUP_ADD",
                        "F_REPORT_PRIVATE_ADD",
                        "F_VALIDATIONRULEGROUP_PRIVATE_ADD",
                        "F_PUSH_ANALYSIS_DELETE",
                        "F_REPLICATE_USER",
                        "F_DATAVALUE_ADD",
                        "F_INSERT_CUSTOM_JS_CSS",
                        "F_DATAELEMENTGROUPSET_DELETE",
                        "F_SQLVIEW_DELETE",
                        "F_ENROLLMENT_CASCADE_DELETE",
                        "F_INDICATORTYPE_ADD",
                        "F_LEGEND_SET_DELETE",
                        "F_VIEW_EVENT_ANALYTICS",
                        "F_IMPORT_EVENTS",
                        "F_INDICATOR_PRIVATE_ADD",
                        "F_EVENTCHART_PUBLIC_ADD",
                        "F_PUSH_ANALYSIS_ADD",
                        "M_dhis-web-event-visualizer",
                        "F_USER_ADD",
                        "F_EXTERNAL_MAP_LAYER_DELETE",
                        "F_SYSTEM_SETTING",
                        "F_ANALYTICSTABLEHOOK_ADD",
                        "F_ATTRIBUTE_PRIVATE_ADD",
                        "F_DOCUMENT_PUBLIC_ADD",
                        "F_TRACKED_ENTITY_ATTRIBUTE_DELETE",
                        "F_VISUALIZATION_PUBLIC_ADD",
                        "M_dhis-web-data-quality",
                        "F_EVENTREPORT_EXTERNAL",
                        "F_DATAELEMENT_PUBLIC_ADD",
                        "F_RUN_VALIDATION",
                        "F_OPTIONGROUP_PRIVATE_ADD",
                        "F_CATEGORY_OPTION_GROUP_DELETE",
                        "M_dhis-web-settings",
                        "F_IMPORT_DATA",
                        "F_PERFORM_ANALYTICS_EXPLAIN",
                        "F_DATA_APPROVAL_WORKFLOW",
                        "F_PROGRAMSTAGE_ADD",
                        "M_dhis-web-maps",
                        "F_ATTRIBUTE_DELETE",
                        "F_OPTIONSET_DELETE",
                        "M_dhis-web-dashboard",
                        "M_dhis-web-data-administration",
                        "F_ACCEPT_DATA_LOWER_LEVELS",
                        "F_OPTIONGROUPSET_PUBLIC_ADD",
                        "M_dhis-web-capture",
                        "F_PROGRAM_INDICATOR_GROUP_PUBLIC_ADD",
                        "F_CATEGORY_DELETE",
                        "M_dhis-web-app-management",
                        "F_INDICATORTYPE_DELETE",
                        "F_INDICATORGROUP_PRIVATE_ADD",
                    ],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "cddnwKV2gm9",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "oXD88WWSQpR",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "DXyJmlo9rge",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "awtnYWiVEd5",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "Superuser",
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    id: "Ufph3mGRmMo",
                    attributeValues: [],
                },
                {
                    name: "TB program",
                    created: "2013-04-09T21:48:27.303",
                    lastUpdated: "2018-02-19T12:04:00.600",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "Access to the TB program in Tracker",
                    authorities: [
                        "F_APPROVE_DATA",
                        "M_dhis-web-pivot",
                        "F_VIEW_UNAPPROVED_DATA",
                        "M_dhis-web-data-visualizer",
                        "M_dhis-web-mapping",
                        "M_dhis-web-dashboard",
                        "F_APPROVE_DATA_LOWER_LEVELS",
                        "M_dhis-web-visualizer",
                        "M_dhis-web-maps",
                    ],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "N3PZBUlN8vq",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "AIK2aQOJIbj",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "FLDWwCTIsv9",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "DXyJmlo9rge",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "TB program",
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    id: "cUlTcejWree",
                    attributeValues: [],
                },
                {
                    name: "User manager",
                    created: "2014-12-26T14:21:00.602",
                    lastUpdated: "2018-02-19T12:04:23.711",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "User manager",
                    authorities: [
                        "M_dhis-web-maintenance-user",
                        "F_USER_VIEW",
                        "F_USER_ADD",
                        "M_dhis-web-dashboard",
                        "F_USER_DELETE",
                    ],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "N3PZBUlN8vq",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "I9fMsY4pRKk",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "User manager",
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    id: "xJZBzAHI88H",
                    attributeValues: [],
                },
                {
                    name: "WHO MCH program",
                    created: "2017-01-19T11:39:17.267",
                    lastUpdated: "2017-05-16T16:54:20.159",
                    translations: [],
                    createdBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    sharing: {
                        owner: "xE7jOejl9FI",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    description: "WHO MCH program",
                    authorities: [],
                    restrictions: [],
                    users: [
                        {
                            id: "XChqCTGhTKv",
                        },
                        {
                            id: "iswBgC3ROmB",
                        },
                        {
                            id: "xbAzaTwEGx0",
                        },
                        {
                            id: "NqCK1Xc93yx",
                        },
                        {
                            id: "wHnX198FGvP",
                        },
                        {
                            id: "ITrQQlJqbaE",
                        },
                        {
                            id: "sVahVulbH6q",
                        },
                        {
                            id: "Wxmqb2tl1B6",
                        },
                        {
                            id: "tiJZaFA1tXp",
                        },
                        {
                            id: "pUxo5bzi05d",
                        },
                        {
                            id: "IriFPYe2sGG",
                        },
                        {
                            id: "gOkrvOSkK91",
                        },
                        {
                            id: "UdIUgDExdIp",
                        },
                        {
                            id: "rIouAxmW0vD",
                        },
                        {
                            id: "wQTgefEcyTG",
                        },
                        {
                            id: "ImbBYJHZrAW",
                        },
                        {
                            id: "hP0k45PbWah",
                        },
                        {
                            id: "akw4ilMLc24",
                        },
                        {
                            id: "AIK2aQOJIbj",
                        },
                        {
                            id: "OSWYhAwJqiC",
                        },
                        {
                            id: "IAzIZweJnhm",
                        },
                        {
                            id: "DJqiGh2fF0E",
                        },
                        {
                            id: "Z7mGnIfGgqL",
                        },
                        {
                            id: "JgIwQOP9ZoL",
                        },
                        {
                            id: "TxWojwwupo5",
                        },
                        {
                            id: "qObaDc0JE3y",
                        },
                        {
                            id: "Fd8GG593HNz",
                        },
                        {
                            id: "yOxbHqttYYC",
                        },
                        {
                            id: "GQSo5nnzord",
                        },
                        {
                            id: "hBqFVto3o8i",
                        },
                        {
                            id: "iPVcWfursz9",
                        },
                        {
                            id: "C6fqFRbKe6r",
                        },
                        {
                            id: "FLDWwCTIsv9",
                        },
                        {
                            id: "nPDnt9rDnOS",
                        },
                        {
                            id: "NPGfSQnWkDF",
                        },
                        {
                            id: "tUf1ZGm1h3O",
                        },
                        {
                            id: "k8TKOqrCzZ5",
                        },
                        {
                            id: "vgSpvvWCbxI",
                        },
                        {
                            id: "CXP91RBlKF9",
                        },
                        {
                            id: "EyUuSlSe50U",
                        },
                        {
                            id: "S2ctxCZzDnY",
                        },
                        {
                            id: "dXcFZem5Jgz",
                        },
                        {
                            id: "oEtWWgCGUif",
                        },
                        {
                            id: "HK7M2Ylun6a",
                        },
                        {
                            id: "xE7jOejl9FI",
                        },
                        {
                            id: "Mw9e2OWvRKr",
                        },
                    ],
                    displayName: "WHO MCH program",
                    favorite: false,
                    user: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    id: "Pqoy4DLOdMK",
                    attributeValues: [],
                },
            ],
            dataSets: [
                {
                    code: "EXP",
                    name: "Expenditures",
                    created: "2018-05-16T18:47:36.063",
                    lastUpdated: "2025-03-28T06:51:44.130",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {
                            rWLrZL8rP3K: {
                                displayName: "Guest User",
                                access: "rw------",
                                id: "rWLrZL8rP3K",
                            },
                        },
                        userGroups: {
                            B6JNeAQ6akX: {
                                displayName: "_DATASET_Superuser",
                                access: "rwrw----",
                                id: "B6JNeAQ6akX",
                            },
                        },
                        public: "rw------",
                    },
                    shortName: "Expenditures",
                    dimensionItemType: "REPORTING_RATE",
                    legendSets: [],
                    periodType: "FinancialApril",
                    dataInputPeriods: [],
                    dataSetElements: [
                        {
                            dataSet: {
                                id: "rsyjyJmYD4J",
                            },
                            dataElement: {
                                id: "BDuY694ZAFa",
                            },
                            categoryCombo: {},
                        },
                    ],
                    indicators: [],
                    compulsoryDataElementOperands: [],
                    sections: [],
                    mobile: false,
                    version: 2,
                    expiryDays: 0,
                    timelyDays: 15,
                    notifyCompletingUser: false,
                    interpretations: [],
                    openFuturePeriods: 2,
                    openPeriodsAfterCoEndDate: 0,
                    fieldCombinationRequired: false,
                    validCompleteOnly: false,
                    noValueRequiresComment: false,
                    skipOffline: false,
                    dataElementDecoration: false,
                    renderAsTabs: false,
                    renderHorizontally: false,
                    compulsoryFieldsCompleteOnly: false,
                    formType: "DEFAULT",
                    displayName: "Expenditures",
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    dimensionItem: "rsyjyJmYD4J",
                    displayShortName: "Expenditures",
                    displayFormName: "Expenditures",
                    id: "rsyjyJmYD4J",
                    attributeValues: [],
                    organisationUnits: [
                        {
                            id: "O6uvpzGd5pu",
                        },
                    ],
                },
            ],
            dataElements: [
                {
                    code: "EXP_CARS",
                    name: "EXP Cars Expense",
                    created: "2018-05-16T18:42:50.898",
                    lastUpdated: "2018-05-16T18:43:32.616",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    shortName: "Cars Expense",
                    formName: "Cars",
                    dimensionItemType: "DATA_ELEMENT",
                    legendSets: [],
                    aggregationType: "SUM",
                    valueType: "INTEGER_ZERO_OR_POSITIVE",
                    domainType: "AGGREGATE",
                    dataSetElements: [
                        {
                            dataSet: {
                                id: "rsyjyJmYD4J",
                            },
                            dataElement: {
                                id: "BDuY694ZAFa",
                            },
                            categoryCombo: {},
                        },
                    ],
                    aggregationLevels: [],
                    zeroIsSignificant: false,
                    optionSetValue: false,
                    dimensionItem: "BDuY694ZAFa",
                    displayShortName: "Cars Expense",
                    displayName: "EXP Cars Expense",
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    displayFormName: "Cars",
                    id: "BDuY694ZAFa",
                    attributeValues: [],
                    dataElementGroups: [
                        {
                            id: "GbSz3TobZcc",
                        },
                    ],
                },
            ],
            dataElementGroups: [
                {
                    name: "Expenditures",
                    created: "2018-05-16T19:13:50.656",
                    lastUpdated: "2018-05-16T19:13:50.656",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    shortName: "Expenditures",
                    dimensionItemType: "DATA_ELEMENT_GROUP",
                    legendSets: [],
                    aggregationType: "SUM",
                    groupSets: [],
                    dimensionItem: "GbSz3TobZcc",
                    displayShortName: "Expenditures",
                    displayName: "Expenditures",
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    displayFormName: "Expenditures",
                    id: "GbSz3TobZcc",
                    attributeValues: [],
                    dataElements: [
                        {
                            id: "BDuY694ZAFa",
                        },
                        {
                            id: "M3anTdbJ7iJ",
                        },
                        {
                            id: "RR538iV9G1X",
                        },
                        {
                            id: "dHrtL2a4EcD",
                        },
                        {
                            id: "ixDKJGrGtFg",
                        },
                    ],
                },
            ],
            organisationUnits: undefined,
        } as unknown as SynchronizationPayload;
    } else if (includeOnlyReferences) {
        return {
            dataSets: [
                {
                    code: "EXP",
                    name: "Expenditures",
                    created: "2018-05-16T18:47:36.063",
                    lastUpdated: "2025-03-28T06:51:44.130",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "xE7jOejl9FI",
                        code: null,
                        name: "John Traore",
                        displayName: "John Traore",
                        username: "admin",
                    },
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {
                            rWLrZL8rP3K: {
                                displayName: "Guest User",
                                access: "rw------",
                                id: "rWLrZL8rP3K",
                            },
                        },
                        userGroups: {
                            B6JNeAQ6akX: {
                                displayName: "_DATASET_Superuser",
                                access: "rwrw----",
                                id: "B6JNeAQ6akX",
                            },
                        },
                        public: "rw------",
                    },
                    shortName: "Expenditures",
                    dimensionItemType: "REPORTING_RATE",
                    legendSets: [],
                    periodType: "FinancialApril",
                    dataInputPeriods: [],
                    dataSetElements: [
                        {
                            dataSet: {
                                id: "rsyjyJmYD4J",
                            },
                            dataElement: {
                                id: "BDuY694ZAFa",
                            },
                            categoryCombo: {},
                        },
                    ],
                    indicators: [],
                    compulsoryDataElementOperands: [],
                    sections: [],
                    mobile: false,
                    version: 2,
                    expiryDays: 0,
                    timelyDays: 15,
                    notifyCompletingUser: false,
                    interpretations: [],
                    openFuturePeriods: 2,
                    openPeriodsAfterCoEndDate: 0,
                    fieldCombinationRequired: false,
                    validCompleteOnly: false,
                    noValueRequiresComment: false,
                    skipOffline: false,
                    dataElementDecoration: false,
                    renderAsTabs: false,
                    renderHorizontally: false,
                    compulsoryFieldsCompleteOnly: false,
                    formType: "DEFAULT",
                    displayName: "Expenditures",
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    dimensionItem: "rsyjyJmYD4J",
                    displayShortName: "Expenditures",
                    displayFormName: "Expenditures",
                    id: "rsyjyJmYD4J",
                    attributeValues: [],
                    organisationUnits: [
                        {
                            id: "O6uvpzGd5pu",
                        },
                    ],
                },
            ],
            dataElements: [
                {
                    code: "EXP_CARS",
                    name: "EXP Cars Expense",
                    created: "2018-05-16T18:42:50.898",
                    lastUpdated: "2018-05-16T18:43:32.616",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    shortName: "Cars Expense",
                    formName: "Cars",
                    dimensionItemType: "DATA_ELEMENT",
                    legendSets: [],
                    aggregationType: "SUM",
                    valueType: "INTEGER_ZERO_OR_POSITIVE",
                    domainType: "AGGREGATE",
                    dataSetElements: [
                        {
                            dataSet: {
                                id: "rsyjyJmYD4J",
                            },
                            dataElement: {
                                id: "BDuY694ZAFa",
                            },
                            categoryCombo: {},
                        },
                    ],
                    aggregationLevels: [],
                    zeroIsSignificant: false,
                    optionSetValue: false,
                    dimensionItem: "BDuY694ZAFa",
                    displayShortName: "Cars Expense",
                    displayName: "EXP Cars Expense",
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    displayFormName: "Cars",
                    id: "BDuY694ZAFa",
                    attributeValues: [],
                    dataElementGroups: [
                        {
                            id: "GbSz3TobZcc",
                        },
                    ],
                },
            ],
            dataElementGroups: [
                {
                    name: "Expenditures",
                    created: "2018-05-16T19:13:50.656",
                    lastUpdated: "2018-05-16T19:13:50.656",
                    translations: [],
                    createdBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    favorites: [],
                    lastUpdatedBy: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    sharing: {
                        owner: "GOLswS44mh8",
                        external: false,
                        users: {},
                        userGroups: {},
                        public: "rw------",
                    },
                    shortName: "Expenditures",
                    dimensionItemType: "DATA_ELEMENT_GROUP",
                    legendSets: [],
                    aggregationType: "SUM",
                    groupSets: [],
                    dimensionItem: "GbSz3TobZcc",
                    displayShortName: "Expenditures",
                    displayName: "Expenditures",
                    favorite: false,
                    user: {
                        id: "GOLswS44mh8",
                        code: null,
                        name: "Tom Wakiki",
                        displayName: "Tom Wakiki",
                        username: "system",
                    },
                    displayFormName: "Expenditures",
                    id: "GbSz3TobZcc",
                    attributeValues: [],
                    dataElements: [
                        {
                            id: "BDuY694ZAFa",
                        },
                        {
                            id: "M3anTdbJ7iJ",
                        },
                        {
                            id: "RR538iV9G1X",
                        },
                        {
                            id: "dHrtL2a4EcD",
                        },
                        {
                            id: "ixDKJGrGtFg",
                        },
                    ],
                },
            ],
            organisationUnits: undefined,
            userGroups: undefined,
            userRoles: undefined,
            users: undefined,
        } as unknown as SynchronizationPayload;
    } else {
        return {
            dataSets: [
                {
                    code: "EXP",
                    name: "Expenditures",
                    created: "2018-05-16T18:47:36.063",
                    lastUpdated: "2025-03-28T06:51:44.130",
                    translations: [],
                    favorites: [],
                    shortName: "Expenditures",
                    dimensionItemType: "REPORTING_RATE",
                    legendSets: [],
                    periodType: "FinancialApril",
                    dataInputPeriods: [],
                    dataSetElements: [
                        {
                            dataSet: {
                                id: "rsyjyJmYD4J",
                            },
                            dataElement: {
                                id: "BDuY694ZAFa",
                            },
                            categoryCombo: {},
                        },
                    ],
                    indicators: [],
                    compulsoryDataElementOperands: [],
                    sections: [],
                    mobile: false,
                    version: 2,
                    expiryDays: 0,
                    timelyDays: 15,
                    notifyCompletingUser: false,
                    interpretations: [],
                    openFuturePeriods: 2,
                    openPeriodsAfterCoEndDate: 0,
                    fieldCombinationRequired: false,
                    validCompleteOnly: false,
                    noValueRequiresComment: false,
                    skipOffline: false,
                    dataElementDecoration: false,
                    renderAsTabs: false,
                    renderHorizontally: false,
                    compulsoryFieldsCompleteOnly: false,
                    formType: "DEFAULT",
                    displayName: "Expenditures",
                    favorite: false,
                    dimensionItem: "rsyjyJmYD4J",
                    displayShortName: "Expenditures",
                    displayFormName: "Expenditures",
                    id: "rsyjyJmYD4J",
                    attributeValues: [],
                },
            ],
            dataElements: [
                {
                    code: "EXP_CARS",
                    name: "EXP Cars Expense",
                    created: "2018-05-16T18:42:50.898",
                    lastUpdated: "2018-05-16T18:43:32.616",
                    translations: [],
                    favorites: [],
                    shortName: "Cars Expense",
                    formName: "Cars",
                    dimensionItemType: "DATA_ELEMENT",
                    legendSets: [],
                    aggregationType: "SUM",
                    valueType: "INTEGER_ZERO_OR_POSITIVE",
                    domainType: "AGGREGATE",
                    dataSetElements: [
                        {
                            dataSet: {
                                id: "rsyjyJmYD4J",
                            },
                            dataElement: {
                                id: "BDuY694ZAFa",
                            },
                            categoryCombo: {},
                        },
                    ],
                    aggregationLevels: [],
                    zeroIsSignificant: false,
                    optionSetValue: false,
                    dimensionItem: "BDuY694ZAFa",
                    displayShortName: "Cars Expense",
                    displayName: "EXP Cars Expense",
                    favorite: false,
                    displayFormName: "Cars",
                    id: "BDuY694ZAFa",
                    attributeValues: [],
                    dataElementGroups: [
                        {
                            id: "GbSz3TobZcc",
                        },
                    ],
                },
            ],
            dataElementGroups: [
                {
                    name: "Expenditures",
                    created: "2018-05-16T19:13:50.656",
                    lastUpdated: "2018-05-16T19:13:50.656",
                    translations: [],
                    favorites: [],
                    shortName: "Expenditures",
                    dimensionItemType: "DATA_ELEMENT_GROUP",
                    legendSets: [],
                    aggregationType: "SUM",
                    groupSets: [],
                    dimensionItem: "GbSz3TobZcc",
                    displayShortName: "Expenditures",
                    displayName: "Expenditures",
                    favorite: false,
                    displayFormName: "Expenditures",
                    id: "GbSz3TobZcc",
                    attributeValues: [],
                    dataElements: [
                        {
                            id: "BDuY694ZAFa",
                        },
                        {
                            id: "M3anTdbJ7iJ",
                        },
                        {
                            id: "RR538iV9G1X",
                        },
                        {
                            id: "dHrtL2a4EcD",
                        },
                        {
                            id: "ixDKJGrGtFg",
                        },
                    ],
                },
            ],
            organisationUnits: undefined,
            userGroups: undefined,
            userRoles: undefined,
            users: undefined,
        } as unknown as SynchronizationPayload;
    }
}
