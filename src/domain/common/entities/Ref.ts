import { Codec, Schema } from "../../../utils/codec";
import { SharingSetting, SharingSettingModel } from "./SharingSetting";

export const RefModel: Codec<Ref> = Schema.object({
    id: Schema.dhis2Id,
});

export interface Ref {
    id: string;
}

export const NamedRefModel: Codec<NamedRef> = Schema.extend(
    RefModel,
    Schema.object({
        name: Schema.string,
    })
);

export interface NamedRef extends Ref {
    name: string;
}

export const DatedRefModel: Codec<DatedRef> = Schema.extend(
    NamedRefModel,
    Schema.object({
        user: NamedRefModel,
        created: Schema.date,
        lastUpdated: Schema.date,
        lastUpdatedBy: NamedRefModel,
    })
);

export interface DatedRef extends NamedRef {
    user: NamedRef;
    created: Date;
    lastUpdated: Date;
    lastUpdatedBy: NamedRef;
}

export const SharedRefModel: Codec<SharedRef> = Schema.extend(
    DatedRefModel,
    Schema.object({
        publicAccess: Schema.string,
        userAccesses: Schema.array(SharingSettingModel),
        userGroupAccesses: Schema.array(SharingSettingModel),
    })
);

export interface SharedRef extends DatedRef {
    publicAccess: string;
    userAccesses: SharingSetting[];
    userGroupAccesses: SharingSetting[];
}

export interface IdentifiableRef extends NamedRef {
    shortName?: string;
    code?: string;
    path?: string;
    level?: number;
}

export function updateObject<T extends Ref>(objects: T[], object: T): T[] {
    const exists = !!objects.find(o => object.id === o.id);

    if (exists) {
        return objects.map(o => (object.id === o.id ? object : o));
    } else {
        return [...objects, object];
    }
}
