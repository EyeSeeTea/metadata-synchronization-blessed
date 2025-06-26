import { D2ConstantSchema } from "@eyeseetea/d2-api/2.33";
import { generateUid } from "d2/uid";
import _ from "lodash";
import { Instance } from "../../domain/instance/entities/Instance";
import { ObjectSharing, StorageClient } from "../../domain/storage/repositories/StorageClient";
import { D2Api, SelectedPick, FieldsOf } from "../../types/d2-api";
import { Dictionary } from "../../types/utils";
import { promiseMap } from "../../utils/common";
import { getD2APiFromInstance } from "../../utils/d2-utils";
import { Future, FutureData } from "../../domain/common/entities/Future";
import { apiToFuture } from "../common/utils/api-futures";

const CONSTANT_NAME = "MDSync Storage";
const CONSTANT_PREFIX = "MDSYNC_";

export class StorageConstantClient extends StorageClient {
    public type = "constant" as const;

    private api: D2Api;

    constructor(instance: Instance) {
        super();
        this.api = getD2APiFromInstance(instance);
    }

    /**
     * @deprecated - We are moving from Promises to Futures, this method will be removed in future refactors.
     * use getObjectFuture instead
     */
    public async getObject<T extends object>(key: string): Promise<T | undefined> {
        const { value } = await this.getConstantPromise<T>(key);
        return value;
    }

    public getObjectFuture<T extends object>(key: string): FutureData<T | undefined> {
        return Future.fromPromise(this.getConstantPromise<T>(key))
            .map(({ value }) => value)
            .mapError(error => {
                console.error(error);
                return error;
            });
    }

    public async getOrCreateObject<T extends object>(key: string, defaultValue: T): Promise<T> {
        const { id, value } = await this.getConstantPromise<T>(key);
        if (!value) await this.updateConstantPromise(id, key, defaultValue);
        return value ?? defaultValue;
    }

    private async getConstants<Fields extends FieldsOf<D2ConstantSchema>>(fields: Fields) {
        const { objects: constants } = await this.api.models.constants
            .get({
                paging: false,
                fields,
                filter: { code: { $like: CONSTANT_PREFIX } },
            })
            .getData();

        return constants;
    }

    public async clean(): Promise<void> {
        const objects = await this.getConstants({ id: true, code: true, name: true });

        const toDelete = _(objects)
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

    public async saveObject<T extends object>(key: string, keyValue: T): Promise<void> {
        const { id } = await this.getConstantPromise<T>(key);
        await this.updateConstantPromise(id, key, keyValue);
    }

    public saveObjectFuture<T extends object>(key: string, keyValue: T): FutureData<void> {
        return this.getConstant<T>(key).flatMap(({ id }) => {
            return this.updateConstant(id, key, keyValue);
        });
    }

    public async removeObject(key: string): Promise<void> {
        const { id } = await this.getConstantPromise<unknown>(key);
        if (id) await this.api.models.constants.delete({ id }).getData();
    }

    public async clearStorage(): Promise<void> {
        try {
            const objects = await this.getConstants({ id: true, code: true, name: true });

            await this.api.metadata.post({ constants: objects }, { importStrategy: "DELETE" }).getData();
        } catch (error: any) {
            console.error(error);
        }
    }

    public async clone(): Promise<Dictionary<unknown>> {
        const objects = await this.getConstants(apiFields);

        // Remove constant prefix key
        return _(objects)
            .map(constant => this.formatConstant(constant))
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
        const objects = await this.getConstants({ code: true });

        return _(objects)
            .map(({ code }) => code.replace(new RegExp(`^${CONSTANT_PREFIX}`, ""), ""))
            .value();
    }

    public async getObjectSharing(key: string): Promise<ObjectSharing | undefined> {
        const { user, userAccesses, userGroupAccesses, publicAccess, externalAccess } = await this.getConstantPromise(
            key
        );

        return { user, userAccesses, userGroupAccesses, publicAccess, externalAccess };
    }

    public async saveObjectSharing(key: string, sharing: ObjectSharing): Promise<void> {
        const { id, value } = await this.getConstantPromise<object>(key);
        if (value) await this.updateConstantPromise<object>(id, key, value, sharing);
    }

    /**
     * @deprecated - We are moving from Promises to Futures, this method will be removed in future refactors.
     * use updateConstant instead
     */
    private async updateConstantPromise<T extends object>(
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
                        shortName: formatName(key),
                        description: JSON.stringify(value, null, 2),
                        value: 1,
                        ...sharing,
                    },
                ],
            })
            .getData();
    }

    private updateConstant<T extends object>(
        id: string,
        key: string,
        value: T,
        sharing: Partial<ObjectSharing> = {}
    ): FutureData<void> {
        return apiToFuture(
            this.api.metadata.post({
                constants: [
                    {
                        id,
                        code: formatKey(key),
                        name: formatName(key),
                        shortName: formatName(key),
                        description: JSON.stringify(value, null, 2),
                        value: 1,
                        ...sharing,
                    },
                ],
            })
        ).flatMap(res => {
            if (res.status === "OK") return Future.success(undefined);
            else return Future.error(new Error("Failed to update constant"));
        });
    }

    /**
     * @deprecated - We are moving from Promises to Futures, this method will be removed in future refactors.
     * use getConstant instead
     */
    private async getConstantPromise<T>(key: string): Promise<Constant & { value?: T }> {
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
        } catch (error: any) {
            console.error(error);
            return this.formatConstant({ id, description, ...rest });
        }
    }

    private getConstant<T>(key: string): FutureData<Constant & { value?: T }> {
        return apiToFuture(
            this.api.models.constants.get({
                paging: false,
                fields: apiFields,
                filter: { code: { eq: formatKey(key) } },
            })
        ).map(({ objects: constants }) => {
            const { id = generateUid(), description, ...rest } = constants[0] ?? {};

            try {
                const value = description ? JSON.parse(description) : undefined;
                return { ...this.formatConstant({ id, description, ...rest }), value };
            } catch (error: any) {
                console.error(error);
                return this.formatConstant({ id, description, ...rest });
            }
        });
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
    shortName: string;
    description: string;
    lastUpdated: Date;
};

const apiFields = {
    id: true,
    code: true,
    name: true,
    shortName: true,
    description: true,
    user: { id: true, name: true },
    created: true,
    userAccesses: { id: true, name: true, displayName: true, access: true },
    userGroupAccesses: { id: true, name: true, displayName: true, access: true },
    publicAccess: true,
    externalAccess: true,
    lastUpdated: true,
} as const;
