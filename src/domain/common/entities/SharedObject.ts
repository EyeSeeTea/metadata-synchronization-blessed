import { NamedRef } from "./NamedRef";
import { SharingSetting } from "./SharingSetting";

export interface SharedObject extends NamedRef {
    publicAccess: string;
    user: NamedRef;
    created: Date;
    userAccesses: SharingSetting[];
    userGroupAccesses: SharingSetting[];
    lastUpdated: Date;
    lastUpdatedBy: NamedRef;
}
