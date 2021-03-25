import { Ref } from "../../common/entities/Ref";

export interface ProgramTrackedEntityAttributeRef {
    trackedEntityAttribute: Ref;
}

export interface ProgramRef {
    id: string;
    programType: "WITH_REGISTRATION" | "WITHOUT_REGISTRATION";
    programTrackedEntityAttributes?: ProgramTrackedEntityAttributeRef[];
    programStages: Ref[];
}
