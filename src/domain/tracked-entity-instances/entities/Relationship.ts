import { TEIRef } from "./TrackedEntityInstance";
export interface Relationship {
    relationshipName: string;
    relationshipType: string;
    relationship: string;
    from: TEIRef;
    to: TEIRef;
}
