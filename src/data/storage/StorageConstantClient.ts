import { generateUid } from "d2/uid";
import _ from "lodash";
import { Instance } from "../../domain/instance/entities/Instance";
import { ObjectSharing, StorageClient } from "../../domain/storage/repositories/StorageClient";
import { D2Api } from "../../types/d2-api";
import { Dictionary } from "../../types/utils";
import { promiseMap } from "../../utils/common";
import { getD2APiFromInstance } from "../../utils/d2-utils";

const CONSTANT_NAME = "MDSync Storage";
const CONSTANT_PREFIX = "MDSYNC_";

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

    public async getObjectSharing(key: string): Promise<ObjectSharing | undefined> {
        const {
            user,
            userAccesses,
            userGroupAccesses,
            publicAccess,
            externalAccess,
        } = await this.getConstant(key);

        return { user, userAccesses, userGroupAccesses, publicAccess, externalAccess };
    }

    public async saveObjectSharing(key: string, sharing: ObjectSharing): Promise<void> {
        const { id, value } = await this.getConstant<object>(key);
        if (value) await this.updateConstant<object>(id, key, value, sharing);
    }

    private async updateConstant<T extends object>(
        id: string,
        key: string,
        value: T,
        sharing: Partial<ObjectSharing> = {}
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
                        ...sharing,
                    },
                ],
            })
            .getData();
    }

    private async getConstant<T>(key: string): Promise<Constant & { value?: T }> {
        const { objects: constants } = await this.api.models.constants
            .get({
                paging: false,
                fields: apiFields,
                filter: { code: { eq: formatKey(key) } },
            })
            .getData();

        const { id = generateUid(), description, ...rest } = constants[0] ?? {};

        try {
            const value = description ? JSON.parse(description) : undefined;
            return { id, description, ...rest, value };
        } catch (error) {
            console.error(error);
            return { id, description, ...rest };
        }
    }

    private async lookupConstants(): Promise<Constant[]> {
        const { objects } = await this.api.models.constants
            .get({
                paging: false,
                fields: apiFields,
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

type Constant = ObjectSharing & {
    id: string;
    code: string;
    name: string;
    description: string;
};

const apiFields = {
    id: true,
    code: true,
    name: true,
    description: true,
    user: { id: true, name: true },
    created: true,
    userAccesses: { id: true, name: true, displayName: true, access: true },
    userGroupAccesses: { id: true, name: true, displayName: true, access: true },
    publicAccess: true,
    externalAccess: true,
} as const;
