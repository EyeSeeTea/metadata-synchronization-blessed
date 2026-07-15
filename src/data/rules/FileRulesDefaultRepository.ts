import _ from "lodash";
import { Either } from "../../domain/common/entities/Either";
import { Instance } from "../../domain/instance/entities/Instance";
import { FileRepository } from "../../domain/file/repositories/FileRepository";
import { SynchronizationRule, SynchronizationRuleData } from "../../domain/rules/entities/SynchronizationRule";
import { FileRulesRepository } from "../../domain/rules/repositories/FileRulesRepository";
import { UserRepository } from "../../domain/user/repositories/UserRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { decodeModel } from "../../utils/codec";
import { promiseMap } from "../../utils/common";
import { SynchronizationRuleModel } from "./models/SynchronizationRuleModel";
import { SynchronizationRulePersistedSnapshot } from "../../domain/rules/PersistedSnapshot";
import { StorageClientFactory } from "../config/StorageClientFactory";
import { Namespace } from "../storage/Namespaces";
import { InstanceDataStoreData } from "../instance/InstanceD2ApiRepository";
import { D2Api } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-utils";
import { getRuleAggregatedDataExchanges } from "./utils/getRuleAggregatedDataExchanges";

export class FileRulesDefaultRepository implements FileRulesRepository {
    private api: D2Api;

    constructor(
        private localInstance: Instance,
        private storageClientFactory: StorageClientFactory,
        private userRepository: UserRepository,
        private fileRepository: FileRepository
    ) {
        this.api = getD2APiFromInstance(this.localInstance);
    }

    public async readFiles(files: File[]): Promise<Either<string, SynchronizationRule>[]> {
        const user = await this.userRepository.getCurrent();

        const items = await promiseMap(files, async file => {
            const objects = await this.fileRepository.readObjectsInFile(file, file.name);

            return promiseMap(objects, async ({ name, value }) => {
                const decoded = decodeModel(SynchronizationRuleModel, value);

                if (decoded.isSuccess()) {
                    try {
                        const ruleData = await this.persistedSnapshotToDomainData(decoded.value.data);
                        const rule = SynchronizationRule.build(ruleData).update({
                            created: new Date(),
                            user,
                            lastUpdated: new Date(),
                            lastExecutedBy: user,
                        });
                        return Either.success<string, SynchronizationRule>(rule);
                    } catch (error: any) {
                        return Either.error<string>(`${name}: ${(error && error.message) || String(error)}`);
                    }
                } else {
                    return Either.error<string>(`${name}: ${decoded.value.error}`);
                }
            });
        });

        return _.flatten(items);
    }

    private async persistedSnapshotToDomainData(
        data: SynchronizationRulePersistedSnapshot
    ): Promise<SynchronizationRuleData> {
        const { aggregatedDataExchanges: adexRefs = [], ...rest } = data;

        if (adexRefs.length === 0) {
            return { ...rest, aggregatedDataExchanges: undefined };
        }

        const instances = await this.getInstances();
        const aggregatedDataExchanges = await getRuleAggregatedDataExchanges(this.api, adexRefs, instances);

        return { ...rest, aggregatedDataExchanges };
    }

    private async getInstances(): Promise<InstanceDataStoreData[]> {
        const storageClient = await this.getStorageClient();
        return storageClient.listObjectsInCollection<InstanceDataStoreData>(Namespace.INSTANCES);
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.storageClientFactory.getStorageClientPromise();
    }
}
