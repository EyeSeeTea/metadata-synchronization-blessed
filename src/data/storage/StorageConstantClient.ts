import { D2ConstantSchema } from "@eyeseetea/d2-api/2.33";
import { generateUid } from "d2/uid";
import _ from "lodash";
import { Instance } from "../../domain/instance/entities/Instance";
import { ObjectSharing, StorageClient } from "../../domain/storage/repositories/StorageClient";
import { D2Api, SelectedPick } from "../../types/d2-api";
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

        // Special scenario, clean history entries
        if (key.startsWith("history")) {
            const constants = await this.lookupConstants();
            const toDelete = _(constants)
                .filter(({ code }) => cleanCode(code).startsWith("history"))
                .orderBy(["lastUpdated"], ["desc"])
                .slice(70)
                .value();

            if (toDelete.length > 0) {
                await this.api.metadata
                    .post(
                        { constants: toDelete.map(({ id, code, name }) => ({ id, code, name })) },
                        { importStrategy: "DELETE" }
                    )
                    .getData();
            }
        }
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

            await this.api.metadata
                .post({ constants: objects }, { importStrategy: "DELETE" })
                .getData();
        } catch (error) {
            console.log(error);
        }
    }

    public async clone(): Promise<Dictionary<unknown>> {
        const constants = await this.lookupConstants();

        // Remove constant prefix key
        return _(constants)
            .map(({ code, description }) => [cleanCode(code), JSON.parse(description)])
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
            return { ...this.formatConstant({ id, description, ...rest }), value };
        } catch (error) {
            console.error(error);
            return this.formatConstant({ id, description, ...rest });
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

        return objects.map(constant => this.formatConstant(constant));
    }

    private formatConstant(item: SelectedPick<D2ConstantSchema, typeof apiFields>): Constant {
        return { ...item, lastUpdated: new Date(item.lastUpdated) };
    }
}

function formatKey(key: string): string {
    return `${CONSTANT_PREFIX}${key}`;
}

function formatName(name: string): string {
    return `${CONSTANT_NAME} - ${_.upperFirst(name)}`;
}

function cleanCode(code: string): string {
    return code.replace(new RegExp(`^${CONSTANT_PREFIX}`, ""), "");
}

type Constant = ObjectSharing & {
    id: string;
    code: string;
    name: string;
    description: string;
    lastUpdated: Date;
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
    lastUpdated: true,
} as const;
