import { Instance } from "../../domain/instance/entities/Instance";
import {
    SynchronizationRule,
    SynchronizationRuleData,
} from "../../domain/rules/entities/SynchronizationRule";
import { RulesRepository } from "../../domain/rules/repositories/RulesRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { Namespace } from "../storage/Namespaces";
import { StorageDataStoreClient } from "../storage/StorageDataStoreClient";

export class RulesD2ApiRepository implements RulesRepository {
    private storageClient: StorageClient;

    constructor(instance: Instance) {
        this.storageClient = new StorageDataStoreClient(instance);
    }

    public async getById(id: string): Promise<SynchronizationRule | undefined> {
        const data = await this.storageClient.getObjectInCollection<SynchronizationRuleData>(
            Namespace.RULES,
            id
        );

        return data ? SynchronizationRule.build(data) : undefined;
    }

    public async getSyncResults(id: string): Promise<SynchronizationRule[]> {
        const data = await this.storageClient.getObject<SynchronizationRule[]>(
            `${Namespace.RULES}-${id}`
        );

        return data ?? [];
    }

    public async list(): Promise<SynchronizationRule[]> {
        const stores = await this.storageClient.listObjectsInCollection<SynchronizationRuleData>(
            Namespace.RULES
        );

        return stores.map(data => SynchronizationRule.build(data));
    }

    public async save(report: SynchronizationRule): Promise<void> {
        await this.storageClient.saveObjectInCollection<SynchronizationRuleData>(
            Namespace.RULES,
            report.toObject()
        );
    }

    public async delete(id: string): Promise<void> {
        await this.storageClient.removeObjectInCollection(Namespace.RULES, id);
    }
}
