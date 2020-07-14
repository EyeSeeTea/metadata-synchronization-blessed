import { SynchronizationBuilder } from "../../../types/synchronization";
import { SharedObject } from "../../common/entities/SharedObject";

export interface SynchronizationRule extends SharedObject {
    code?: string;
    created: Date;
    description?: string;
    builder: SynchronizationBuilder;
    enabled: boolean;
    lastExecuted?: Date;
    frequency?: string;
    type: SyncRuleType;
}

export type SyncRuleType = "metadata" | "aggregated" | "events" | "deleted";
