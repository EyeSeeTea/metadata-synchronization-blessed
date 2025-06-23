import { NamedRef } from "../../common/entities/Ref";
import { Instance } from "../../instance/entities/Instance";
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
    response?: object;
}

export function getSuccessDefaultSyncReportByType(
    type: SynchronizationResultType,
    instance: Instance
): SynchronizationResult {
    return {
        status: "SUCCESS",
        stats: {
            imported: 0,
            updated: 0,
            deleted: 0,
            ignored: 0,
            total: 0,
        },
        instance: instance.toPublicObject(),
        date: new Date(),
        type: type,
    };
}
