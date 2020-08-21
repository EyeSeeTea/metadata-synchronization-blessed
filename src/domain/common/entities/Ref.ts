import { Id } from "./Schemas";
import { SharingSetting } from "./SharingSetting";

export interface Ref {
    id: Id;
}

export interface NamedRef extends Ref {
    name: string;
}

export interface DatedRef extends NamedRef {
    user: NamedRef;
    created: Date;
    lastUpdated: Date;
    lastUpdatedBy: NamedRef;
}

export interface SharedRef extends DatedRef {
    publicAccess: string;
    userAccesses: SharingSetting[];
    userGroupAccesses: SharingSetting[];
}
