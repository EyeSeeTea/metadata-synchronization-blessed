import JSZip from "jszip";
import _ from "lodash";
import { ConfigRepository } from "../../domain/config/repositories/ConfigRepository";
import {
    SynchronizationRule,
    SynchronizationRuleData,
} from "../../domain/rules/entities/SynchronizationRule";
import { RulesRepository } from "../../domain/rules/repositories/RulesRepository";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { promiseMap } from "../../utils/common";
import { Namespace } from "../storage/Namespaces";

export class RulesD2ApiRepository implements RulesRepository {
    constructor(private configRepository: ConfigRepository) {}

    public async import(files: File[]): Promise<void> {
        // Rules can be either JSON files or zip files with multiple JSON files
        const items = await promiseMap(files, async file => {
            if (file.type === "application/json") {
                try {
                    const data = await file.arrayBuffer();
                    const payload = JSON.parse(data.toString());
                    return payload;
                } catch (error) {
                    return undefined;
                }
            }

            const zip = new JSZip();
            const contents = await zip.loadAsync(file);
            const modulePaths = this.getModulePaths(contents);

            return promiseMap(modulePaths, async modulePath =>
                this.getJsonFromFile<SynchronizationRuleData>(zip, modulePath)
            );
        });

        // TODO: Add validation
        const rules = _(items)
            .compact()
            .flatten()
            .map(data => SynchronizationRule.build(data))
            .value();

        await promiseMap(rules, rule => this.save(rule));
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

    public async save(rule: SynchronizationRule): Promise<void> {
        const storageClient = await this.getStorageClient();
        await storageClient.saveObjectInCollection<SynchronizationRuleData>(
            Namespace.RULES,
            rule.toObject()
        );
    }

    public async delete(id: string): Promise<void> {
        const storageClient = await this.getStorageClient();
        await storageClient.removeObjectInCollection(Namespace.RULES, id);
    }

    private getStorageClient(): Promise<StorageClient> {
        return this.configRepository.getStorageClient();
    }

    private async getJsonFromFile<T>(zip: JSZip, filename: string): Promise<T | undefined> {
        const obj = zip.file(filename);
        if (!obj) return;
        const blob = await obj.async("blob");
        const text = await blob.text();
        return JSON.parse(text) as T;
    }

    private getModulePaths(contents: JSZip) {
        return _(contents.files)
            .pickBy((_zip, path) => path.endsWith(".json"))
            .keys()
            .compact()
            .value();
    }
}
