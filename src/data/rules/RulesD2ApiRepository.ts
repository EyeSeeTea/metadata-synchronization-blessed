import _ from "lodash";
import { Either } from "../../domain/common/entities/Either";
import { ConfigRepository } from "../../domain/config/repositories/ConfigRepository";
import { FileRepository } from "../../domain/file/repositories/FileRepository";
import {
    SynchronizationRule,
    SynchronizationRuleData,
} from "../../domain/rules/entities/SynchronizationRule";
import { RulesRepository } from "../../domain/rules/repositories/RulesRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { UserRepository } from "../../domain/user/repositories/UserRepository";
import { decodeModel } from "../../utils/codec";
import { promiseMap } from "../../utils/common";
import { Namespace } from "../storage/Namespaces";
import { SynchronizationRuleModel } from "./models/SynchronizationRuleModel";

export class RulesD2ApiRepository implements RulesRepository {
    constructor(
        private configRepository: ConfigRepository,
        private userRepository: UserRepository,
        private fileDataRepository: FileRepository
    ) {}

    public async readFiles(files: File[]): Promise<Either<string, SynchronizationRule>[]> {
        const user = await this.userRepository.getCurrent();

        const items = await promiseMap(files, async file => {
            const objects = await this.fileDataRepository.readObjectsInFile(file, file.name);
            return objects.map(({ name, value }) =>
                decodeModel(SynchronizationRuleModel, value)
                    .map(data =>
                        SynchronizationRule.build(data).update({
                            created: new Date(),
                            user,
                            lastUpdated: new Date(),
                            lastExecutedBy: user,
                        })
                    )
                    .mapError(error => `${name}: ${error}`)
            );
        });

        return _.flatten(items);
    }

    public async getById(id: string): Promise<SynchronizationRule | undefined> {
        const storageClient = await this.getStorageClient();
        const data = await storageClient.getObjectInCollection<SynchronizationRuleData>(
            Namespace.RULES,
            id
        );

        return data ? SynchronizationRule.build(data) : undefined;
    }

    public async getSyncResults(id: string): Promise<SynchronizationRule[]> {
        const storageClient = await this.getStorageClient();
        const data = await storageClient.getObject<SynchronizationRule[]>(
            `${Namespace.RULES}-${id}`
        );

        return data ?? [];
    }

    public async list(): Promise<SynchronizationRule[]> {
        const storageClient = await this.getStorageClient();
        const stores = await storageClient.listObjectsInCollection<SynchronizationRuleData>(
            Namespace.RULES
        );

        return stores.map(data => SynchronizationRule.build(data));
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
        return this.configRepository.getStorageClient();
    }
}
