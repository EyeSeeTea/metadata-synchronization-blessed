import { generateUid } from "d2/uid";
import { Instance } from "../../domain/instance/entities/Instance";
import { StorageClient } from "../../domain/storage/repositories/StorageClient";
import { D2Api } from "../../types/d2-api";
import { Dictionary } from "../../types/utils";
import { getD2APiFromInstance } from "../../utils/d2-utils";

const defaultName = "MDSync Storage";
const defaultKey = "MDSYNC_STORAGE";

export class StorageConstantClient extends StorageClient {
    public type = "constant" as const;

    private api: D2Api;

    constructor(instance: Instance) {
        super();
        this.api = getD2APiFromInstance(instance);
    }

    public async getObject<T extends object>(key: string): Promise<T | undefined> {
        const { value } = await this.getConstant<Dictionary<T>>();
        return value ? value[key] : undefined;
    }

    public async getOrCreateObject<T extends object>(key: string, defaultValue: T): Promise<T> {
        const { id, value = {} } = await this.getConstant<Dictionary<T>>();
        if (!value[key]) {
            await this.updateConstant(id, { ...value, [key]: defaultValue });
        }
        return value[key] ?? defaultValue;
    }

    public async saveObject<T extends object>(key: string, keyValue: T): Promise<void> {
        const { id, value = {} } = await this.getConstant<Dictionary<T>>();
        await this.updateConstant(id, { ...value, [key]: keyValue });
    }

    public async removeObject(key: string): Promise<void> {
        const { id, value = {} } = await this.getConstant<Dictionary<unknown>>();
        await this.updateConstant(id, { ...value, [key]: undefined });
    }

    public async clearStorage(): Promise<void> {
        try {
            const { objects: constants } = await this.api.models.constants
                .get({
                    paging: false,
                    fields: { id: true, code: true, name: true, description: true },
                    filter: { code: { eq: defaultKey } },
                })
                .getData();

            const { id } = constants[0] ?? {};

            if (id) await this.api.models.constants.delete({ id }).getData();
        } catch (error) {
            console.log(error);
        }
    }

    public async clone(): Promise<Dictionary<unknown>> {
        const { value = {} } = await this.getConstant<Dictionary<unknown>>();
        return value;
    }

    public async import(value: Dictionary<unknown>): Promise<void> {
        const { id } = await this.getConstant();
        await this.updateConstant(id, value);
    }

    public async listKeys(): Promise<string[]> {
        const { value = {} } = await this.getConstant<Dictionary<unknown>>();
        return Object.keys(value);
    }

    private async updateConstant<T extends object>(id: string, value: T): Promise<void> {
        await this.api.metadata
            .post({
                constants: [
                    {
                        id,
                        code: defaultKey,
                        name: defaultName,
                        description: JSON.stringify(value, null, 2),
                        value: 1,
                    },
                ],
            })
            .getData();
    }

    private async getConstant<T>(): Promise<{ id: string; value?: T }> {
        const { objects: constants } = await this.api.models.constants
            .get({
                paging: false,
                fields: { id: true, code: true, name: true, description: true },
                filter: { code: { eq: defaultKey } },
            })
            .getData();

        const { id = generateUid(), description } = constants[0] ?? {};

        try {
            const value = description ? JSON.parse(description) : undefined;
            return { id, value };
        } catch (error) {
            console.error(error);
        }

        return { id };
    }
}
