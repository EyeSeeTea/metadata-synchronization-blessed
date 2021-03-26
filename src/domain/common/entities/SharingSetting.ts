import { GetSchemaType, Schema } from "../../../utils/codec";

export const SharingSettingModel = Schema.object({
    access: Schema.string,
    id: Schema.dhis2Id,
    displayName: Schema.string,
    name: Schema.optional(Schema.string),
});

export type SharingSetting = GetSchemaType<typeof SharingSettingModel>;
