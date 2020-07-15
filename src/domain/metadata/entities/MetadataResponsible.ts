import { SharedRef } from "../../common/entities/Ref";
import { MetadataEntities } from "./MetadataEntities";

export interface MetadataResponsible
    extends Pick<SharedRef, "id" | "userAccesses" | "userGroupAccesses"> {
    entity: keyof MetadataEntities;
}
