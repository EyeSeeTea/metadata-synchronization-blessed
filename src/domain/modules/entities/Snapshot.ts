import { NamedRef } from "../../common/entities/NamedRef";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";

export interface Snapshot extends NamedRef {
    module: string;
    revision: string;
    author: {
        name: string;
        email: string;
    };
    contents: MetadataPackage;
}
