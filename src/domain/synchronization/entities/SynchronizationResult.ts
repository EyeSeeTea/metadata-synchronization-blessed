import { NamedRef } from "../../common/entities/Ref";
import { PublicInstance } from "../../instance/entities/Instance";
import { Store } from "../../packages/entities/Store";
import { SynchronizationType } from "./SynchronizationType";

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
    origin?: PublicInstance | Store;
    instance: PublicInstance;
    originPackage?: NamedRef;
    date: Date;
    type: SynchronizationType;
    message?: string;
    stats?: SynchronizationStats;
    typeStats?: SynchronizationStats[];
    errors?: ErrorMessage[];
}
