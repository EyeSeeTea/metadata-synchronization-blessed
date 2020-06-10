import { MetadataIncludeExcludeRules } from "../../../types/synchronization";
import { SharedObject } from "../../common/entities/SharedObject";

// Represents a sync rule of type module frozen in time
export interface Module extends SharedObject {
    metadataIds: string[];
    useDefaultIncludeExclude: boolean;
    metadataIncludeExcludeRules?: MetadataIncludeExcludeRules;
}
