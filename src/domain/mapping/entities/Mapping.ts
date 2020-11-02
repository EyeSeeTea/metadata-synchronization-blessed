import { generateUid } from "d2/uid";
import _ from "lodash";
import { PartialBy } from "../../../types/utils";
import { MetadataMappingDictionary } from "../../instance/entities/MetadataMapping";

export interface MappingStoreOwner {
    type: "store";
    id: string;
    moduleId: string;
}

export interface MappingInstanceOwner {
    type: "instance";
    id: string;
}

export type MappingOwner = MappingStoreOwner | MappingInstanceOwner;

export const isMappingStoreOwner = (source: MappingOwner): source is MappingStoreOwner => {
    return source.type === "store";
};

export const isMappingInstanceOwner = (source: MappingOwner): source is MappingInstanceOwner => {
    return source.type === "instance";
};

export type MappingOwnerType = "instance" | "store";

export interface MappingData {
    id: string;
    owner: MappingOwner;
    mappingDictionary: MetadataMappingDictionary;
}

export class Mapping implements MappingData {
    public readonly id: string;
    public readonly mappingDictionary: MetadataMappingDictionary;
    public readonly owner: MappingOwner;

    constructor(private data: MappingData) {
        this.id = data.id;
        this.mappingDictionary = data.mappingDictionary;
        this.owner = data.owner;
    }

    public static build(data: PartialBy<MappingData, "id">): Mapping {
        return new Mapping({ id: generateUid(), ...data });
    }

    public updateMappingDictionary(metadataMapping: MetadataMappingDictionary): Mapping {
        return new Mapping({ ...this.data, mappingDictionary: metadataMapping });
    }

    public toObject(): MappingData {
        return _.cloneDeep(this.data);
    }
}
