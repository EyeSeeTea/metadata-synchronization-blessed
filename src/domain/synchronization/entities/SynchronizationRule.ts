import { SynchronizationBuilder } from "../../../types/synchronization";
import { SharedRef } from "../../common/entities/Ref";

export interface SynchronizationRule extends SharedRef {
    code?: string;
    created: Date;
    description?: string;
    builder: SynchronizationBuilder;
    enabled: boolean;
    lastExecuted?: Date;
    frequency?: string;
    type: SyncRuleType;
    originInstance: string;
}

export type SyncRuleType = "metadata" | "aggregated" | "events" | "deleted";
