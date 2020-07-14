import { NamedRef } from "../../common/entities/Ref";
import { Id } from "../../common/entities/Schemas";
import { MetadataEntities } from "./MetadataEntities";

export interface MetadataResponsible {
    id: Id;
    entity: keyof MetadataEntities;
    user: NamedRef;
}
