import { Instance } from "../../instance/entities/Instance";
import { Store } from "../../packages/entities/Store";

export type PackageSource = Instance | Store;

export const isInstance = (source: Instance | Store): source is Instance => {
    return (source as Instance).version !== undefined;
};

export const isStore = (source: Instance | Store): source is Store => {
    return (source as Store).token !== undefined;
};
