import { NamedRef } from "../../common/entities/NamedRef";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";

export type PackageLocation = "github" | "dataStore";

export interface Package extends NamedRef {
    location: PackageLocation;
    module: string;
    revision: string;
    version: string;
    author: {
        name: string;
        email: string;
    };
    contents: MetadataPackage;
}
