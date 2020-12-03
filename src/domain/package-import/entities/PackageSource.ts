import { Instance } from "../../instance/entities/Instance";
import { Store } from "../../stores/entities/Store";

export type PackageSource = Instance | Store;

export const isInstance = (source: PackageSource): source is Instance => {
    return (source as Instance).version !== undefined;
};

export const isStore = (source: PackageSource): source is Store => {
    return (source as Store).token !== undefined;
};
