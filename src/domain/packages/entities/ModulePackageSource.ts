import { Instance } from "../../instance/entities/Instance";
import { Store } from "./Store";

export type ModulePackageSource = Instance | Store;

export type ModulePackageSourceType = "local" | "remote" | "store";

export type ModulePackageSourceId = {
    id: string;
    type: ModulePackageSourceType;
};

// function isInstance(source: Instance | Store): source is Instance {
//     return (source as Instance).version !== undefined;
// }

// function isStore(source: Instance | Store): source is Store {
//     return (source as Store).token !== undefined;
// }
