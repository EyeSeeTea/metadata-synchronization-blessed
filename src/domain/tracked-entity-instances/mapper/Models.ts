export interface ProgramTrackedEntityAttributeRef {
    trackedEntityAttribute: { id: string };
}

export interface ProgramRef {
    id: string;
    programType: "WITH_REGISTRATION" | "WITHOUT_REGISTRATION";
    programTrackedEntityAttributes?: ProgramTrackedEntityAttributeRef[];
}
