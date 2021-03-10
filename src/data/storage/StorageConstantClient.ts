import { generateUid } from "d2/uid";
import _ from "lodash";
import { Instance } from "../../domain/instance/entities/Instance";
import { ObjectSharing, StorageClient } from "../../domain/storage/repositories/StorageClient";
import { D2Api } from "../../types/d2-api";
import { Dictionary } from "../../types/utils";
import { promiseMap } from "../../utils/common";
import { getD2APiFromInstance } from "../../utils/d2-utils";

const CONSTANT_NAME = "MDSync Storage";
const CONSTANT_PREFIX = "MDSYNC_STORAGE_";

export class StorageConstantClient extends StorageClient {
    public type = "constant" as const;

    private api: D2Api;

    constructor(instance: Instance) {
        super();
        this.api = getD2APiFromInstance(instance);
    }

    public async getObject<T extends object>(key: string): Promise<T | undefined> {
        const { value } = await this.getConstant<T>(key);
        return value;
    }

    public async getOrCreateObject<T extends object>(key: string, defaultValue: T): Promise<T> {
        const { id, value } = await this.getConstant<T>(key);
        if (!value) await this.updateConstant(id, key, defaultValue);
        return value ?? defaultValue;
    }

    public async saveObject<T extends object>(key: string, keyValue: T): Promise<void> {
        const { id } = await this.getConstant<T>(key);
        await this.updateConstant(id, key, keyValue);
    }

    public async removeObject(key: string): Promise<void> {
        const { id } = await this.getConstant<unknown>(key);
        if (id) await this.api.models.constants.delete({ id }).getData();
    }

    public async clearStorage(): Promise<void> {
        try {
            const { objects } = await this.api.models.constants
                .get({
                    paging: false,
                    fields: { id: true, code: true, name: true, description: true },
                    filter: { code: { $like: CONSTANT_PREFIX } },
                })
                .getData();

            await promiseMap(objects, ({ id }) =>
                this.api.models.constants.delete({ id }).getData()
            );
        } catch (error) {
            console.log(error);
        }
    }

    public async clone(): Promise<Dictionary<unknown>> {
        const constants = await this.lookupConstants();

        return _(constants)
            .map(({ code, description }) => [
                code.replace(new RegExp(`^${CONSTANT_PREFIX}`, ""), ""),
                JSON.parse(description),
            ])
            .fromPairs()
            .value();
    }

    public async import(dump: Dictionary<unknown>): Promise<void> {
        const pairs = _.toPairs(dump);

        await promiseMap(pairs, async ([key, value]) => {
            await this.saveObject(key, value as object);
        });
    }

    public async listKeys(): Promise<string[]> {
        const constants = await this.lookupConstants();

        return _(constants)
            .map(({ code }) => code.replace(new RegExp(`^${CONSTANT_PREFIX}`, ""), ""))
            .value();
    }

    public getObjectSharing(_key: string): Promise<ObjectSharing | undefined> {
        throw new Error("Method not implemented.");
    }

    public saveObjectSharing(_key: string, _object: ObjectSharing): Promise<void> {
        throw new Error("Method not implemented.");
    }

    private async updateConstant<T extends object>(
        id: string,
        key: string,
        value: T
    ): Promise<void> {
        await this.api.metadata
            .post({
                constants: [
                    {
                        id,
                        code: formatKey(key),
                        name: formatName(key),
                        description: JSON.stringify(value, null, 2),
                        value: 1,
                    },
                ],
            })
            .getData();
    }

    private async getConstant<T>(key: string): Promise<{ id: string; code?: string; value?: T }> {
        const { objects: constants } = await this.api.models.constants
            .get({
                paging: false,
                fields: { id: true, code: true, name: true, description: true },
                filter: { code: { eq: formatKey(key) } },
            })
            .getData();

        const { id = generateUid(), code, description } = constants[0] ?? {};

        try {
            const value = description ? JSON.parse(description) : undefined;
            return { id, code, value };
        } catch (error) {
            console.error(error);
            return { id, code };
        }
    }

    private async lookupConstants(): Promise<Constant[]> {
        const { objects } = await this.api.models.constants
            .get({
                paging: false,
                fields: { id: true, code: true, name: true, description: true },
                filter: { code: { $like: CONSTANT_PREFIX } },
            })
            .getData();

        return objects;
    }
}

function formatKey(key: string): string {
    return _.toUpper(_.snakeCase(`${CONSTANT_PREFIX}_${key}`));
}

function formatName(name: string): string {
    return _.startCase(`${CONSTANT_NAME} - ${name}`);
}

interface Constant {
    id: string;
    code: string;
    name: string;
    description: string;
}
