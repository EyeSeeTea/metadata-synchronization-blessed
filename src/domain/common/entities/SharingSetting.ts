import { Codec, Schema } from "../../../utils/codec";

export const SharingSettingModel: Codec<SharingSetting> = Schema.object({
    access: Schema.string,
    id: Schema.dhis2Id,
    displayName: Schema.string,
    name: Schema.optional(Schema.string),
});

export interface SharingSetting {
    access: string;
    displayName: string;
    id: string;
    name?: string;
}
