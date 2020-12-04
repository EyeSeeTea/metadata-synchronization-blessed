import { Instance } from "../../domain/instance/entities/Instance";
import {
    SynchronizationReport,
    SynchronizationReportData,
} from "../../domain/reports/entities/SynchronizationReport";
import { SynchronizationResult } from "../../domain/reports/entities/SynchronizationResult";
import { ReportsRepository } from "../../domain/reports/repositories/ReportsRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { Namespace } from "../storage/Namespaces";
import { StorageDataStoreClient } from "../storage/StorageDataStoreClient";

export class ReportsD2ApiRepository implements ReportsRepository {
    private storageClient: StorageClient;

    constructor(instance: Instance) {
        this.storageClient = new StorageDataStoreClient(instance);
    }

    public async getById(id: string): Promise<SynchronizationReport | undefined> {
        const data = await this.storageClient.getObjectInCollection<SynchronizationReportData>(
            Namespace.HISTORY,
            id
        );

        return data ? SynchronizationReport.build(data) : undefined;
    }

    public async getSyncResults(id: string): Promise<SynchronizationResult[]> {
        const data = await this.storageClient.getObject<SynchronizationResult[]>(
            `${Namespace.HISTORY}-${id}`
        );

        return data ?? [];
    }

    public async list(): Promise<SynchronizationReport[]> {
        const stores = await this.storageClient.listObjectsInCollection<SynchronizationReportData>(
            Namespace.HISTORY
        );

        return stores.map(data => SynchronizationReport.build(data));
    }

    public async save(report: SynchronizationReport): Promise<void> {
        await this.storageClient.saveObjectInCollection<SynchronizationReportData>(
            Namespace.HISTORY,
            report.toObject()
        );
    }

    public async delete(id: string): Promise<void> {
        await this.storageClient.removeObjectInCollection(Namespace.HISTORY, id);
    }
}
