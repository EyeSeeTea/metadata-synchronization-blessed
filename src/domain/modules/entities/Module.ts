import { MetadataIncludeExcludeRules } from "../../../types/synchronization";
import { SharedObject } from "../../common/entities/SharedObject";

export type ModuleType = "metadata";

interface BaseModule extends SharedObject {
    description: string;
    type: ModuleType;
}

export interface MetadataModule extends BaseModule {
    type: "metadata";
    metadataIds: string[];
    useDefaultIncludeExclude: boolean;
    metadataIncludeExcludeRules?: MetadataIncludeExcludeRules;
}

export type Module = MetadataModule;
