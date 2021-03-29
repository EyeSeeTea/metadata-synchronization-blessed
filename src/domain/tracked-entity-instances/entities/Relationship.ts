import { TrackedEntityInstance } from "./TrackedEntityInstance";

export interface Relationship {
    lastUpdated: string;
    created: string;
    relationshipName: string;
    bidirectional: boolean;
    relationshipType: string;
    relationship: string;
    from: TrackedEntityInstance;
    to: TrackedEntityInstance;
}
