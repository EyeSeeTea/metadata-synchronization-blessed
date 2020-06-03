import { SynchronizationBuilder } from "../../../types/synchronization";
import { NamedRef } from "../../common/entities/NamedRef";
import { SharingSetting } from "../../common/entities/SharingSetting";

export interface SynchronizationRule {
    id: string;
    name: string;
    code?: string;
    created: Date;
    description?: string;
    builder: SynchronizationBuilder;
    enabled: boolean;
    lastExecuted?: Date;
    lastUpdated: Date;
    lastUpdatedBy: NamedRef;
    frequency?: string;
    publicAccess: string;
    user: NamedRef;
    userAccesses: SharingSetting[];
    userGroupAccesses: SharingSetting[];
    type: SyncRuleType;
}

export type SyncRuleType = "metadata" | "aggregated" | "events" | "deleted";
