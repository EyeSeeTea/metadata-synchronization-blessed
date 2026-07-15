// DHIS2 caps the aggregate data exchange source request name at 50 characters (error E4001).
export const MAX_ADEX_SOURCE_REQUEST_NAME_LENGTH = 50;

type AggregatedDataExchangeRequest = {
    name: string;
    dx: string[];
    pe: string[];
    ou: string[];
    filters: string[];
    inputIdScheme: Scheme;
    outputIdScheme: Scheme;
    outputDataElementIdScheme: Scheme;
    outputOrgUnitIdScheme: Scheme;
};

type AggregatedDataExchangeSource = {
    params?: {
        periodTypes: string[];
    };
    requests: AggregatedDataExchangeRequest[];
};

type AggregatedDataExchangeApiConfig = {
    url: string;
    username?: string;
    password?: string;
    token?: string;
};

type AggregatedDataExchangeTarget = {
    type: "EXTERNAL" | "INTERNAL";
    api?: AggregatedDataExchangeApiConfig;
    request: {
        idScheme: Scheme;
        dataElementIdScheme: Scheme;
        orgUnitIdScheme: Scheme;
        categoryOptionComboIdScheme: Scheme;
    };
};

type Scheme = "UID" | "CODE";

export type AggregatedDataExchange = {
    id: string;
    name: string;
    source: AggregatedDataExchangeSource;
    target: AggregatedDataExchangeTarget;
};
