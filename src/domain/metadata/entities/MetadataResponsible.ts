import { NamedRef } from "../../common/entities/Ref";
import { MetadataEntities } from "./MetadataEntities";

export interface MetadataResponsible extends NamedRef {
    users: NamedRef[];
    userGroups: NamedRef[];
    entity: keyof MetadataEntities;
}
