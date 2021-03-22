import { Enrollment } from "./Enrollment";
import { Relationship } from "./Relationship";
import { TrakedEntityAttribute } from "./TrackedEntityAttribute";

export interface ProgramOwner {
    ownerOrgUnit: string;
    program: string;
    trackedEntityInstance: string;
}

export interface TEIRef {
    trackedEntityInstance: {
        trackedEntityInstance: string;
        programOwners: ProgramOwner[];
    };
}

export interface TrackedEntityInstance {
    trackedEntityInstance: string;
    created: string;
    orgUnit: string;
    createdAtClient: string;
    lastUpdated: string;
    trackedEntityType: string;
    lastUpdatedAtClient: string;
    inactive: boolean;
    deleted: boolean;
    featureType: string;
    programOwners: ProgramOwner[];
    enrollments: Enrollment[];
    relationships: Relationship[];
    attributes: TrakedEntityAttribute[];
}
