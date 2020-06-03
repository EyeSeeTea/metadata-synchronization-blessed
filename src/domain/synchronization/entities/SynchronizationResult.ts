import { SyncRuleType } from "../../../types/synchronization";
import { PublicInstance } from "../../instance/Instance";

export type SynchronizationStatus = "PENDING" | "SUCCESS" | "WARNING" | "ERROR" | "NETWORK ERROR";

export interface SynchronizationStats {
    type?: string;
    imported: number;
    updated: number;
    ignored: number;
    deleted: number;
    total?: number;
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
    typeStats?: SynchronizationStats[];
    errors?: ErrorMessage[];
}
