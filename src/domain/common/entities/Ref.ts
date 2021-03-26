import { GetSchemaType, Schema } from "../../../utils/codec";
import { SharingSettingModel } from "./SharingSetting";

export const RefModel = Schema.object({
    id: Schema.dhis2Id,
});

export const NamedRefModel = Schema.extend(
    RefModel,
    Schema.object({
        name: Schema.string,
    })
);

export const DatedRefModel = Schema.extend(
    NamedRefModel,
    Schema.object({
        user: NamedRefModel,
        created: Schema.date,
        lastUpdated: Schema.date,
        lastUpdatedBy: NamedRefModel,
    })
);

export const SharedRefModel = Schema.extend(
    DatedRefModel,
    Schema.object({
        publicAccess: Schema.string,
        userAccesses: Schema.array(SharingSettingModel),
        userGroupAccesses: Schema.array(SharingSettingModel),
    })
);

export type Ref = GetSchemaType<typeof RefModel>;
export type NamedRef = GetSchemaType<typeof NamedRefModel>;
export type DatedRef = GetSchemaType<typeof DatedRefModel>;
export type SharedRef = GetSchemaType<typeof SharedRefModel>;

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
