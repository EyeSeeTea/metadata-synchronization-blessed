import { ConfigRepository } from "../../domain/config/repositories/ConfigRepository";
import {
    SynchronizationReport,
    SynchronizationReportData,
} from "../../domain/reports/entities/SynchronizationReport";
import { SynchronizationResult } from "../../domain/reports/entities/SynchronizationResult";
import { ReportsRepository } from "../../domain/reports/repositories/ReportsRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { Namespace } from "../storage/Namespaces";

export class ReportsD2ApiRepository implements ReportsRepository {
    constructor(private configRepository: ConfigRepository) {}

    public async getById(id: string): Promise<SynchronizationReport | undefined> {
        const storageClient = await this.getStorageClient();
        const data = await storageClient.getObjectInCollection<SynchronizationReportData>(
            Namespace.HISTORY,
            id
        );

        return data ? SynchronizationReport.build(data) : undefined;
    }

    public async getSyncResults(id: string): Promise<SynchronizationResult[]> {
        const storageClient = await this.getStorageClient();
        const data = await storageClient.getObject<SynchronizationResult[]>(
            `${Namespace.HISTORY}-${id}`
        );

        return data ?? [];
    }

    public async list(): Promise<SynchronizationReport[]> {
        const storageClient = await this.getStorageClient();
        const stores = await storageClient.listObjectsInCollection<SynchronizationReportData>(
            Namespace.HISTORY
        );

        return stores.map(data => SynchronizationReport.build(data));
    }

    public async save(report: SynchronizationReport): Promise<void> {
        const storageClient = await this.getStorageClient();

        await storageClient.saveObjectInCollection<SynchronizationReportData>(
            Namespace.HISTORY,
            report.toObject()
        );

        // We do not store payload on the data store
        await storageClient.saveObject<SynchronizationResult[]>(
            `${Namespace.HISTORY}-${report.id}`,
            report.getResults().map(({ payload: _payload, ...rest }) => ({ ...rest }))
        );
    }

    public async delete(id: string): Promise<void> {
        const storageClient = await this.getStorageClient();
        await storageClient.removeObjectInCollection(Namespace.HISTORY, id);
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.configRepository.getStorageClient();
    }
}
