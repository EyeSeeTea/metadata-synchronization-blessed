import { generateUid } from "d2/uid";
import _ from "lodash";
import { PartialBy } from "../../../types/utils";
import { MappingOwner } from "./MappingOwner";
import { MetadataMappingDictionary } from "./MetadataMapping";

export interface DataSourceMappingData {
    id: string;
    owner: MappingOwner;
    mappingDictionary: MetadataMappingDictionary;
}

export class DataSourceMapping implements DataSourceMappingData {
    public readonly id: string;
    public readonly mappingDictionary: MetadataMappingDictionary;
    public readonly owner: MappingOwner;

    constructor(private data: DataSourceMappingData) {
        this.id = data.id;
        this.mappingDictionary = data.mappingDictionary;
        this.owner = data.owner;
    }

    public static build(data: PartialBy<DataSourceMappingData, "id">): DataSourceMapping {
        return new DataSourceMapping({ id: generateUid(), ...data });
    }

    public updateMappingDictionary(metadataMapping: MetadataMappingDictionary): DataSourceMapping {
        return new DataSourceMapping({ ...this.data, mappingDictionary: metadataMapping });
    }

    public toObject(): DataSourceMappingData {
        return _.cloneDeep(this.data);
    }
}
