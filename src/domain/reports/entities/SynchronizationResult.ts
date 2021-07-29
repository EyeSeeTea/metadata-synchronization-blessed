import { NamedRef } from "../../common/entities/Ref";
import { Store } from "../../stores/entities/Store";
import { SynchronizationPayload } from "../../synchronization/entities/SynchronizationPayload";
import { SynchronizationResultType } from "../../synchronization/entities/SynchronizationType";

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
    origin?: NamedRef | Store; // TODO: Create union
    instance: NamedRef;
    originPackage?: NamedRef;
    date: Date;
    type: SynchronizationResultType;
    message?: string;
    stats?: SynchronizationStats;
    typeStats?: SynchronizationStats[];
    errors?: ErrorMessage[];
    payload?: SynchronizationPayload;
}
