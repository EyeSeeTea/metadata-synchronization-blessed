import debug from "debug";
import { MigrationParams } from ".";
import { Debug } from "../../../domain/migrations/entities/Debug";
import { SynchronizationReportData } from "../../../domain/reports/entities/SynchronizationReport";
import { AppStorage, Migration } from "../client/types";

export interface SynchronizationResultOld {
    status: "PENDING" | "SUCCESS" | "WARNING" | "ERROR" | "NETWORK ERROR";
    date: Date;
    stats: {
        type?: string;
        created?: number; // DELETED
        imported?: number; // NOW MANDATORY
        updated: number;
        ignored: number;
        deleted: number;
        total?: number;
    };
    instance: {
        id: string;
        name: string;
        url: string;
        username: string;
        description?: string;
        version?: string;
    };
    report: {
        typeStats: {
            // Extracted
            type?: string;
            created?: number; // DELETED
            imported?: number; // NOW MANDATORY
            updated: number;
            ignored: number;
            deleted: number;
            total?: number;
        }[];
        messages: {
            // Extracted and renamed to errors
            uid: string; // Renamed to id
            type: string;
            message: string;
            property: string;
        }[];
    };
}

interface SynchronizationResultNew {
    status: "PENDING" | "SUCCESS" | "WARNING" | "ERROR" | "NETWORK ERROR";
    instance: {
        id: string;
        name: string;
        url: string;
        username: string;
        description?: string;
        version?: string;
    };
    date: Date;
    type: "metadata" | "aggregated" | "events" | "deleted" | "trackedEntityInstances";
    message?: string;
    stats?: {
        type?: string;
        imported: number;
        updated: number;
        ignored: number;
        deleted: number;
        total?: number;
    };
    typeStats?: {
        type?: string;
        imported: number;
        updated: number;
        ignored: number;
        deleted: number;
        total?: number;
    }[];
    errors?: {
        id: string;
        message: string;
        type?: string;
        property?: string;
    }[];
}

export async function migrate(storage: AppStorage, _debug: Debug, _params: MigrationParams): Promise<void> {
    const dataStoreKeys = await storage.listKeys();

    const notificationKeys = dataStoreKeys
        .filter(key => key.startsWith("notifications-"))
        .map(key => key.replace("notifications-", ""));

    const notifications = (await storage.get<SynchronizationReportData[]>("notifications")) ?? [];

    for (const notification of notificationKeys) {
        const { type = "metadata" } = notifications.find(({ id }) => id === notification) ?? {};
        debug(`Updating ${type} notification ${notification}`);

        const oldNotification = (await storage.get<SynchronizationResultOld[]>(`notifications-${notification}`)) ?? [];

        const newNotification: SynchronizationResultNew[] = oldNotification.map(
            ({
                stats: { created = 0, imported = 0, ...stats } = {
                    imported: 0,
                    updated: 0,
                    ignored: 0,
                    deleted: 0,
                },
                report: { typeStats = [], messages = [] } = {},
                ...rest
            }) => ({
                type,
                ...rest,
                stats: {
                    ...stats,
                    imported: created + imported,
                },
                typeStats: typeStats.map(({ created = 0, imported = 0, ...stats }) => ({
                    ...stats,
                    imported: created + imported,
                })),
                errors: messages.map(({ uid, ...errors }) => ({
                    ...errors,
                    id: uid,
                })),
            })
        );

        await storage.save(`notifications-${notification}`, newNotification);
    }
}

const migration: Migration<MigrationParams> = { name: "Update sync reports", migrate };

export default migration;
