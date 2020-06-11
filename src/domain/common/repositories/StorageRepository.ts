import _ from "lodash";
import { Ref } from "../entities/Ref";

export abstract class StorageRepository {
    // Object operations
    public abstract getObject<T extends object>(key: string, defaultValue: T): Promise<T>;
    public abstract saveObject<T extends object>(key: string, value: T): Promise<void>;
    public abstract removeObject(key: string): Promise<void>;

    public async listObjectsInCollection<T extends Ref>(key: string): Promise<T[]> {
        return await this.getObject<T[]>(key, []);
    }

    public async getObjectInCollection<T extends Ref>(
        key: string,
        id: string
    ): Promise<T | undefined> {
        const rawData = await this.getObject<T[]>(key, []);
        return _.find(rawData, element => element.id === id);
    }

    public async saveObjectInCollection<T extends Ref>(key: string, element: T): Promise<void> {
        const oldData = await this.getObject(key, [] as Ref[]);
        const cleanData = oldData.filter(item => item.id !== element.id);
        const newData = [...cleanData, element];
        await this.saveObject(key, newData);
    }

    public async removeObjectInCollection(key: string, id: string): Promise<void> {
        const oldData = await this.getObject(key, [] as Ref[]);
        const newData = _.reject(oldData, { id });
        await this.saveObject(key, newData);
    }
}
