import { Codec, Schema } from "../../../utils/codec";

// NOTICE: This is refactored
export const ConfigModel: Codec<SchedulerConfig> = Schema.object({
    baseUrl: Schema.string,
    username: Schema.string,
    password: Schema.string,
    encryptionKey: Schema.string,
});

export interface SchedulerConfig {
    baseUrl: string;
    username: string;
    password: string;
    encryptionKey: string;
}
