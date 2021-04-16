import { SharingSetting } from "./SharingSetting";

export interface Ref {
    id: string;
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

export interface IdentifiableRef extends NamedRef {
    shortName?: string;
    code?: string;
    path?: string;
    level?: number;
}

export interface SharedRef extends DatedRef {
    publicAccess: string;
    userAccesses: SharingSetting[];
    userGroupAccesses: SharingSetting[];
}

export function updateObject<T extends Ref>(objects: T[], object: T): T[] {
    const exists = !!objects.find(o => object.id === o.id);

    if (exists) {
        return objects.map(o => (object.id === o.id ? object : o));
    } else {
        return [...objects, object];
    }
}
