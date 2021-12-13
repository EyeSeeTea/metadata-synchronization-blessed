import { ConfigRepository } from "../../domain/config/repositories/ConfigRepository";
import { SynchronizationReport, SynchronizationReportData } from "../../domain/reports/entities/SynchronizationReport";
import { SynchronizationResult } from "../../domain/reports/entities/SynchronizationResult";
import { ReportsRepository } from "../../domain/reports/repositories/ReportsRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { Namespace } from "../storage/Namespaces";

export class ReportsD2ApiRepository implements ReportsRepository {
    constructor(private configRepository: ConfigRepository) {}

    public async getById(id: string): Promise<SynchronizationReport | undefined> {
        try {
            const storageClient = await this.getStorageClient();
            const data = await storageClient.getObjectInCollection<SynchronizationReportData>(Namespace.HISTORY, id);
            return data ? SynchronizationReport.build(data) : undefined;
        } catch (error: any) {
            console.error(error);
            return undefined;
        }
    }

    public async getSyncResults(id: string): Promise<SynchronizationResult[]> {
        try {
            const storageClient = await this.getStorageClient();
            const data = await storageClient.getObject<SynchronizationResult[]>(`${Namespace.HISTORY}-${id}`);
            return data ?? [];
        } catch (error: any) {
            console.error(error);
            return [];
        }
    }

    public async list(): Promise<SynchronizationReport[]> {
        try {
            const storageClient = await this.getStorageClient();
            const stores = await storageClient.listObjectsInCollection<SynchronizationReportData>(Namespace.HISTORY);
            return stores.map(data => SynchronizationReport.build(data));
        } catch (error: any) {
            console.error(error);
            return [];
        }
    }

    public async save(report: SynchronizationReport): Promise<void> {
        try {
            const storageClient = await this.getStorageClient();

            await storageClient.saveObjectInCollection<SynchronizationReportData>(Namespace.HISTORY, report.toObject());

            // We do not store payload on the data store
            await storageClient.saveObject<SynchronizationResult[]>(
                `${Namespace.HISTORY}-${report.id}`,
                report.getResultsForSave()
            );
        } catch (error: any) {
            console.error(error);
        }
    }

    public async clean(): Promise<void> {
        try {
            const storageClient = await this.getStorageClient();
            await storageClient.clean();
        } catch (error: any) {
            console.error(error);
        }
    }

    public async delete(id: string): Promise<void> {
        try {
            const storageClient = await this.getStorageClient();
            await storageClient.removeObjectInCollection(Namespace.HISTORY, id);
        } catch (error: any) {
            console.error(error);
        }
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.configRepository.getStorageClient();
    }
}
