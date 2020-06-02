import { SyncRuleType } from "../../../types/synchronization";
import { PublicInstance } from "../../instance/Instance";

export type SynchronizationStatus = "PENDING" | "SUCCESS" | "WARNING" | "ERROR" | "NETWORK ERROR";

export interface SynchronizationStats {
    imported: number;
    updated: number;
    ignored: number;
    deleted: number;
    total?: number;
}

export interface TypeStats {
    type?: string;
    stats: SynchronizationStats;
}

export interface ErrorMessage {
    id: string;
    message: string;
    type?: string;
    property?: string;
}

export interface SynchronizationResult {
    status: SynchronizationStatus;
    instance: PublicInstance;
    date: Date;
    type: SyncRuleType;
    message?: string;
    stats?: SynchronizationStats;
    typeStats?: TypeStats[];
    errors?: ErrorMessage[];
}
