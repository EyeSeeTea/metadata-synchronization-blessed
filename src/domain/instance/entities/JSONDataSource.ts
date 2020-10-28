import { MetadataPackage } from "../../metadata/entities/MetadataEntities";

export interface JSONDataSource {
    type: "json";
    version: string;
    metadata: MetadataPackage<Record<string, any>>;
}
