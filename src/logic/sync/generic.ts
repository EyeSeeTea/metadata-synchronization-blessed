import i18n from "@dhis2/d2-i18n";
import { D2Api } from "d2-api";
import _ from "lodash";
import memoize from "nano-memoize";
import Instance from "../../models/instance";
import SyncReport from "../../models/syncReport";
import SyncRule from "../../models/syncRule";
import { D2, DataImportResponse, DataImportStatus, MetadataImportResponse } from "../../types/d2";
import {
    SynchronizationBuilder,
    SynchronizationReportStatus,
    SynchronizationResult,
    SyncRuleType,
    MetadataPackage,
    AggregatedPackage,
    EventsPackage,
} from "../../types/synchronization";
import { getMetadata } from "../../utils/synchronization";

export abstract class GenericSync {
    protected readonly d2: D2;
    protected readonly api: D2Api;
    protected readonly builder: SynchronizationBuilder;

    protected abstract readonly type: SyncRuleType;

    constructor(d2: D2, api: D2Api, builder: SynchronizationBuilder) {
        this.d2 = d2;
        this.api = api;
        this.builder = builder;
    }

    protected abstract async buildPayload(): Promise<
        MetadataPackage | AggregatedPackage | EventsPackage
    >;
    protected abstract async postPayload(
        instance: Instance
    ): Promise<MetadataImportResponse | DataImportResponse>;
    protected abstract cleanResponse(
        response: MetadataImportResponse | DataImportResponse,
        instance: Instance
    ): SynchronizationResult;

    protected extractMetadata = memoize(async () => {
        const { metadataIds } = this.builder;
        const { baseUrl } = this.d2.Api.getApi();
        const fields = this.type === "aggregated" ? "id,dataSetElements,dataElementGroups" : "id";

        return getMetadata(baseUrl, metadataIds, fields);
    });

    private async buildSyncReport() {
        const { syncRule } = this.builder;
        const metadataPackage = await this.extractMetadata();

        return SyncReport.build({
            user: this.d2.currentUser.username,
            types: _.keys(metadataPackage),
            status: "RUNNING" as SynchronizationReportStatus,
            syncRule,
            type: "events",
        });
    }

    public async *execute() {
        const { targetInstances: targetInstanceIds, syncRule } = this.builder;
        yield { message: i18n.t("Preparing synchronization") };

        // Build instance list
        const targetInstances: Instance[] = await Promise.all(
            targetInstanceIds.map(id => Instance.get(this.d2, id))
        );

        // Initialize sync report
        const syncReport = await this.buildSyncReport();
        syncReport.addSyncResult(
            ...targetInstances.map(instance => ({
                instance: instance.toObject(),
                status: "PENDING" as DataImportStatus,
                date: new Date(),
            }))
        );

        yield { syncReport };
        for (const instance of targetInstances) {
            yield {
                message: i18n.t("Importing data in instance {{instance}}", {
                    instance: instance.name,
                }),
            };

            console.debug("Start import on destination instance", instance.toObject());
            const response = await this.postPayload(instance);
            syncReport.addSyncResult(this.cleanResponse(response, instance));
            console.debug("Finished importing data on instance", instance.toObject());

            yield { syncReport };
        }

        // Phase 4: Update sync rule last executed date
        if (syncRule) {
            const oldRule = await SyncRule.get(this.d2, syncRule);
            const updatedRule = oldRule.updateLastExecuted(new Date());
            await updatedRule.save(this.d2);
        }

        // Phase 5: Update parent task status
        syncReport.setStatus(syncReport.hasErrors() ? "FAILURE" : "DONE");
        yield { syncReport, done: true };

        return syncReport;
    }
}
