import { Dictionary } from "../../../types/utils";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";

export interface JSONDataSource {
    type: "json";
    name: "JSON";
    version: string;
    metadata: MetadataPackage<Dictionary<any>>;
}

export class JSONDataSource {
    public static build(version: string, metadata: MetadataPackage<Dictionary<any>>): JSONDataSource {
        return {
            type: "json",
            name: "JSON",
            version,
            metadata,
        };
    }
}
