import { SynchronizationReport } from "../../domain/synchronization/entities/SynchronizationReport";
import { getDataStore, saveDataStore } from "../../models/dataStore";
import { D2Api } from "../../types/d2-api";
import { Debug } from "../types";

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
    type: "metadata" | "aggregated" | "events" | "deleted";
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

export default async function migrate(api: D2Api, debug: Debug): Promise<void> {
    const dataStoreKeys = await api.dataStore("metadata-synchronization").getKeys().getData();

    const notificationKeys = dataStoreKeys
        .filter(key => key.startsWith("notifications-"))
        .map(key => key.replace("notifications-", ""));

    const notifications = await getDataStore<SynchronizationReport[]>(api, "notifications", []);

    for (const notification of notificationKeys) {
        const { type = "metadata" } = notifications.find(({ id }) => id === notification) ?? {};
        debug(`Updating ${type} notification ${notification}`);

        const oldNotification = await getDataStore<SynchronizationResultOld[]>(
            api,
            `notifications-${notification}`,
            []
        );

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

        await saveDataStore(api, `notifications-${notification}`, newNotification);
    }
}
