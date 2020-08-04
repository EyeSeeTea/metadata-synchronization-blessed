import _ from "lodash";
import { MetadataEntities, MetadataPackage } from "../../domain/metadata/entities/MetadataEntities";
import { D2MetadataPackage } from "./types";

export function renameProp(item: any, oldPath: string, newPath: string) {
    const object = _.cloneDeep(item);

    const value = _.get(object, oldPath);
    _.unset(object, oldPath);
    _.set(object, newPath, value);

    return object;
}

export function renamePropInMetadataPackage(
    payload: MetadataPackage,
    type: keyof MetadataEntities,
    oldPropName: string,
    newPropName: string
): D2MetadataPackage {
    const itemsByType = payload[type];
    if (!itemsByType) return payload;

    const renamedTypeItems = itemsByType.map((item: unknown) =>
        renameProp(item, oldPropName, newPropName)
    );

    return { ...payload, [type]: renamedTypeItems };
}
