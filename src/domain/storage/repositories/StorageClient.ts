import _ from "lodash";
import { NamespaceProperties } from "../../../data/storage/Namespaces";
import { Dictionary } from "../../../types/utils";
import { Ref } from "../../common/entities/Ref";
import { SharingSetting } from "../../common/entities/SharingSetting";
import { Instance } from "../../instance/entities/Instance";

export interface StorageClientConstructor {
    new (instance: Instance): StorageClient;
}

export interface ObjectSharing {
    publicAccess: string;
    externalAccess: boolean;
    user: {
        id: string;
        name: string;
    };
    userAccesses: SharingSetting[];
    userGroupAccesses: SharingSetting[];
}

export abstract class StorageClient {
    public abstract type: "constant" | "dataStore";

    // Object operations
    public abstract getObject<T extends object>(key: string): Promise<T | undefined>;
    public abstract getOrCreateObject<T extends object>(key: string, defaultValue: T): Promise<T>;
    public abstract saveObject<T extends object>(key: string, value: T): Promise<void>;
    public abstract removeObject(key: string): Promise<void>;
    public abstract clearStorage(): Promise<void>;
    public abstract clone(): Promise<Dictionary<unknown>>;
    public abstract import(dump: Dictionary<unknown>): Promise<void>;
    public abstract listKeys(): Promise<string[]>;
    public abstract getObjectSharing(key: string): Promise<ObjectSharing | undefined>;
    public abstract saveObjectSharing(key: string, object: ObjectSharing): Promise<void>;
    public async clean(): Promise<void> {}

    public async listObjectsInCollection<T extends Ref>(key: string): Promise<T[]> {
        const collection = await this.getObject<T[]>(key);
        return collection ?? [];
    }

    public async getObjectInCollection<T extends Ref>(key: string, id: string): Promise<T | undefined> {
        const rawData = (await this.getObject<T[]>(key)) ?? [];
        const baseElement = _.find(rawData, element => element.id === id);
        if (!baseElement) return undefined;

        const advancedProperties = NamespaceProperties[key];
        if (advancedProperties.length > 0) {
            const advancedElement = (await this.getObject(`${key}-${id}`)) ?? {};
            return { ...baseElement, ...advancedElement } as T;
        }

        return baseElement;
    }

    public async saveObjectsInCollection<T extends Ref>(key: string, elements: T[]): Promise<void> {
        const oldData: Ref[] = (await this.getObject(key)) ?? [];
        const cleanData = oldData.filter(item => !elements.some(element => item.id === element.id));

        // Save base elements directly into collection: model
        const advancedProperties = NamespaceProperties[key];
        const baseElements = elements.map(element => _.omit(element, advancedProperties));

        await this.saveObject(key, [...cleanData, ...baseElements]);

        // Save advanced properties to its own key: model-id
        if (advancedProperties.length > 0) {
            for (const element of elements) {
                const advancedElement = _.pick(element, advancedProperties);
                await this.saveObject(`${key}-${element.id}`, advancedElement);
            }
        }
    }

    public async saveObjectInCollection<T extends Ref>(key: string, element: T): Promise<void> {
        const oldData: Ref[] = (await this.getObject(key)) ?? [];
        const cleanData = oldData.filter(item => item.id !== element.id);
        const advancedProperties = NamespaceProperties[key];

        // Save base element directly into collection: model
        const baseElement = _.omit(element, advancedProperties);
        await this.saveObject(key, [...cleanData, baseElement]);

        // Save advanced properties to its own key: model-id
        if (advancedProperties.length > 0) {
            const advancedElement = _.pick(element, advancedProperties);
            await this.saveObject(`${key}-${element.id}`, advancedElement);
        }
    }

    public async removeObjectInCollection(key: string, id: string): Promise<void> {
        const oldData: Ref[] = (await this.getObject(key)) ?? [];
        const newData = _.reject(oldData, { id });
        await this.saveObject(key, newData);

        const advancedProperties = NamespaceProperties[key];
        if (advancedProperties.length > 0) {
            await this.removeObject(`${key}-${id}`);
        }
    }
}
