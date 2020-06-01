export interface EventsPackage {
    events: ProgramEvent[];
}

export interface ProgramEvent {
    id: string;
    orgUnit: string;
    orgUnitName?: string;
    program: string;
    href: string;
    programStage: string;
    created: string;
    deleted: boolean;
    lastUpdated: string;
    status: string;
    storedBy: string;
    dueDate: string;
    eventDate: string;
    attributeCategoryOptions?: string;
    attributeOptionCombo?: string;
    dataValues: ProgramEventDataValue[];
}

export interface ProgramEventDataValue {
    lastUpdated: string;
    storedBy: string;
    created: string;
    dataElement: string;
    value: any;
    providedElsewhere: boolean;
}
