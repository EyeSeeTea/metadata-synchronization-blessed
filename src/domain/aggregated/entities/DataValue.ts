export interface DataValue {
    dataElement: string;
    period: string;
    orgUnit: string;
    categoryOptionCombo?: string;
    attributeOptionCombo?: string;
    value: string;
    comment?: string;
    storedBy?: string;
    created?: string;
    lastUpdated?: string;
    followUp?: boolean;
}
