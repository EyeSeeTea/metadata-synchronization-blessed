import { Enrollment } from "./Enrollment";
import { Relationship } from "./Relationship";
import { TrakedEntityAttribute } from "./TrackedEntityAttribute";

export interface ProgramOwner {
    orgUnit: string;
    program: string;
    trackedEntity: string;
}

export interface TEIRef {
    trackedEntity?: {
        trackedEntity: string;
    };
}

export interface TrackedEntityInstance {
    trackedEntity: string;
    createdAt?: string;
    orgUnit: string;
    createdAtClient?: string;
    updatedAt?: string;
    trackedEntityType?: string;
    updatedAtClient?: string;
    inactive?: boolean;
    deleted?: boolean;
    programOwners: ProgramOwner[];
    enrollments: Enrollment[];
    relationships: Relationship[];
    attributes: TrakedEntityAttribute[];
}
