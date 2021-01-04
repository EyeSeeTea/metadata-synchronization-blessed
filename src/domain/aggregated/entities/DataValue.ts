export interface DataValue {
    dataElement: string;
    period: string;
    orgUnit: string;
    categoryOptionCombo?: string;
    attributeOptionCombo?: string;
    value: string;
    storedBy: string;
    created: string;
    lastUpdated: string;
    followUp: boolean;
    comment?: string;
}
