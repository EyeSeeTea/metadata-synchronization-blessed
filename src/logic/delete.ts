import i18n from "@dhis2/d2-i18n";

import Instance from "../models/instance";
import SyncReport from "../models/syncReport";
import { getMetadata, postMetadata, cleanImportResponse } from "../utils/synchronization";
import { D2, MetadataImportStatus } from "../types/d2";
import {
    SynchronizationBuilder,
    SynchronizationState,
    SynchronizationReportStatus,
} from "../types/synchronization";

export async function* startDelete(
    d2: D2,
    builder: SynchronizationBuilder
): AsyncIterableIterator<SynchronizationState> {
    const { targetInstances: targetInstanceIds, metadataIds } = builder;

    // Phase 1: Compare for each destination instance if the ids exists
    console.debug("Start delete process");
    yield { message: i18n.t("Retrieving information from remote instances") };

    const targetInstances: Instance[] = await Promise.all(
        targetInstanceIds.map(id => Instance.get(d2, id))
    );

    const syncReport = SyncReport.build({
        user: d2.currentUser.username,
        types: ["deletedObjects"],
        status: "RUNNING" as SynchronizationReportStatus,
    });
    syncReport.addSyncResult(
        ...targetInstances.map(instance => ({
            instance: instance.toObject(),
            status: "PENDING" as MetadataImportStatus,
            date: new Date(),
        }))
    );
    yield { syncReport };

    for (const instance of targetInstances) {
        yield {
            message: i18n.t("Deleting objects in instance {{instance}}", {
                instance: instance.name,
            }),
        };
        console.debug(
            "Deleting metadata on destination instance",
            instance.toObject(),
            metadataIds
        );
        const itemsToDelete = await getMetadata(instance.apiUrl, metadataIds, "id", instance.auth);
        const response = await postMetadata(instance, itemsToDelete, { importStrategy: "DELETE" });

        syncReport.addSyncResult(cleanImportResponse(response, instance));
        console.debug("Finished deleting metadata on instance", instance.toObject(), itemsToDelete);
        yield { syncReport };
    }

    // Phase 5: Update parent task status
    syncReport.setStatus(syncReport.hasErrors() ? "FAILURE" : "DONE");
    yield { syncReport, done: true };

    return syncReport;
}
