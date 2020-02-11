import i18n from "@dhis2/d2-i18n";
import { D2Api } from "d2-api";
import _ from "lodash";
import Instance from "../models/instance";
import SyncReport from "../models/syncReport";
import { D2, ImportStatus } from "../types/d2";
import {
    SynchronizationBuilder,
    SynchronizationReportStatus,
    SynchronizationState,
} from "../types/synchronization";
import { cleanMetadataImportResponse, getMetadata, postMetadata } from "../utils/synchronization";

export async function* startDelete(
    d2: D2,
    _api: D2Api,
    builder: SynchronizationBuilder
): AsyncIterableIterator<SynchronizationState> {
    const { targetInstances: targetInstanceIds, metadataIds } = builder;

    // Phase 1: Compare for each destination instance if the ids exists
    console.debug("Start delete process");
    yield { message: i18n.t("Retrieving information from remote instances") };

    const targetInstances: Instance[] = _.compact(
        await Promise.all(targetInstanceIds.map(id => Instance.get(d2, id)))
    );

    const syncReport = SyncReport.build({
        user: d2.currentUser.username,
        types: ["deletedObjects"],
        status: "RUNNING" as SynchronizationReportStatus,
        type: "metadata",
    });
    syncReport.addSyncResult(
        ...targetInstances.map(instance => ({
            instance: instance.toObject(),
            status: "PENDING" as ImportStatus,
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

        syncReport.addSyncResult(cleanMetadataImportResponse(response, instance));
        console.debug("Finished deleting metadata on instance", instance.toObject(), itemsToDelete);
        yield { syncReport };
    }

    // Phase 5: Update parent task status
    syncReport.setStatus(syncReport.hasErrors() ? "FAILURE" : "DONE");
    yield { syncReport, done: true };

    return syncReport;
}
