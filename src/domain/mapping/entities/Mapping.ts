import { generateUid } from "d2/uid";
import _ from "lodash";
import { Ref } from "../../common/entities/Ref";
import { MetadataMappingDictionary } from "../../instance/entities/MetadataMapping";

export interface MappingStoreOwner {
    id: string;
    moduleId: string;
}

export type MappingInstanceOwner = Ref;

export type MappingOwner = MappingStoreOwner | MappingInstanceOwner;

export const isMappingStoreOwner = (source: MappingOwner): source is MappingStoreOwner => {
    return (source as MappingStoreOwner).moduleId !== undefined;
};

export interface MappingData {
    id: string;
    owner: MappingOwner;
    ownerType: "INSTANCE" | "STORE";
    metadataMapping: MetadataMappingDictionary;
}

export class Mapping implements MappingData {
    public readonly id: string;
    public readonly metadataMapping: MetadataMappingDictionary;
    public readonly owner: MappingOwner;
    public readonly ownerType: "INSTANCE" | "STORE";

    constructor(private data: MappingData) {
        this.id = data.id;
        this.metadataMapping = data.metadataMapping;
        this.owner = data.owner;
        this.ownerType = data.ownerType;
    }

    public static createNew(data: Omit<MappingData, "id">): Mapping {
        return new Mapping({ id: generateUid(), ...data });
    }

    public static createExisted(data: MappingData): Mapping {
        return new Mapping({ ...data });
    }

    public updateMetadataMapping(metadataMapping: MetadataMappingDictionary): Mapping {
        return new Mapping({ ...this.data, metadataMapping });
    }

    public toObject(): MappingData {
        return _.cloneDeep(this.data);
    }
}
