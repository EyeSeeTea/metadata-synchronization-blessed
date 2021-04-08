import { Ref, NamedRef, DatedRef, SharedRef } from "../../../domain/common/entities/Ref";
import { Codec, Schema } from "../../../utils/codec";
import { SharingSettingModel } from "./SharingSettingModel";

export const RefModel: Codec<Ref> = Schema.object({
    id: Schema.string,
});

export const NamedRefModel: Codec<NamedRef> = Schema.extend(
    RefModel,
    Schema.object({
        name: Schema.string,
    })
);

export const DatedRefModel: Codec<DatedRef> = Schema.extend(
    NamedRefModel,
    Schema.object({
        user: NamedRefModel,
        created: Schema.date,
        lastUpdated: Schema.date,
        lastUpdatedBy: NamedRefModel,
    })
);

export const SharedRefModel: Codec<SharedRef> = Schema.extend(
    DatedRefModel,
    Schema.object({
        publicAccess: Schema.string,
        userAccesses: Schema.array(SharingSettingModel),
        userGroupAccesses: Schema.array(SharingSettingModel),
    })
);
