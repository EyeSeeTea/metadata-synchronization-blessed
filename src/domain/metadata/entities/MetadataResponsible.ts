import { NamedRef } from "../../common/entities/Ref";
import { Id } from "../../common/entities/Schemas";
import { MetadataEntity } from "./MetadataEntities";

export interface MetadataResponsible {
    user: NamedRef;
    metadata: {
        type: MetadataEntity;
        id: Id;
    }
}
