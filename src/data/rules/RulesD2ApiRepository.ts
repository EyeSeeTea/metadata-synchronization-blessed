import { SynchronizationRule, SynchronizationRuleData } from "../../domain/rules/entities/SynchronizationRule";
import { RulesRepository } from "../../domain/rules/repositories/RulesRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { UserRepository } from "../../domain/user/repositories/UserRepository";
import { Namespace } from "../storage/Namespaces";
import { StorageClientFactory } from "../config/StorageClientFactory";

export class RulesD2ApiRepository implements RulesRepository {
    constructor(private storageClientFactory: StorageClientFactory, private userRepository: UserRepository) {}

    public async getById(id: string): Promise<SynchronizationRule | undefined> {
        const storageClient = await this.getStorageClient();
        const data = await storageClient.getObjectInCollection<SynchronizationRuleData>(Namespace.RULES, id);

        return data ? SynchronizationRule.build(data) : undefined;
    }

    public async getSyncResults(id: string): Promise<SynchronizationRule[]> {
        const storageClient = await this.getStorageClient();
        const data = await storageClient.getObject<SynchronizationRule[]>(`${Namespace.RULES}-${id}`);

        return data ?? [];
    }

    public async list(allProperties?: boolean): Promise<SynchronizationRule[]> {
        const rulesData = await this.getRulesData(allProperties);
        return rulesData.map(ruleData => SynchronizationRule.build(ruleData));
    }

    private async getRulesData(allProperties?: boolean): Promise<SynchronizationRuleData[]> {
        const storageClient = await this.getStorageClient();

        if (allProperties) {
            return storageClient.getObjectsInCollection<SynchronizationRuleData>(Namespace.RULES);
        } else {
            return storageClient.listObjectsInCollection<SynchronizationRuleData>(Namespace.RULES);
        }
    }

    public async save(rules: SynchronizationRule[]): Promise<void> {
        const user = await this.userRepository.getCurrent();
        const data = rules.map(rule =>
            rule
                .update({
                    lastUpdated: new Date(),
                    lastUpdatedBy: { id: user.id, name: user.name },
                })
                .toObject()
        );

        const storageClient = await this.getStorageClient();
        await storageClient.saveObjectsInCollection<SynchronizationRuleData>(Namespace.RULES, data);
    }

    public async delete(id: string): Promise<void> {
        const storageClient = await this.getStorageClient();
        await storageClient.removeObjectInCollection(Namespace.RULES, id);
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.storageClientFactory.getStorageClientPromise();
    }
}
