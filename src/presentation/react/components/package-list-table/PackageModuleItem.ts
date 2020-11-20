import { BasePackage } from "../../../../domain/packages/entities/Package";
import { FlattenUnion } from "../../../../utils/flatten-union";

export type PackageModuleItem = FlattenUnion<ModuleItem | PackageItem>;

export interface ModuleItem {
    id: string;
    name: string;
    version: string;
    packages: PackageItem[];
}

export type InstallStatus = "Installed" | "NotInstalled" | "Upgrade";
export type PackageItem = Omit<BasePackage, "contents"> & { installStatus: InstallStatus };

export const isPackageItem = (item: PackageModuleItem): item is PackageItem => {
    return (item as PackageItem).version !== undefined;
};

export const groupPackageByModuleAndVersion = (packages: PackageItem[]) => {
    return packages.reduce((acc, item) => {
        const parent = acc.find(
            parent => parent.id === item.module.id && parent.version === item.version
        );

        if (parent) {
            return acc.map(parentItem =>
                parentItem.id === item.module.id && parentItem.version === item.version
                    ? { ...parentItem, packages: [...parentItem.packages, item] }
                    : parentItem
            );
        } else {
            const newParent = {
                id: item.module.id,
                name: item.module.name,
                version: item.version,
                packages: [item],
            };
            return [...acc, newParent];
        }
    }, [] as ModuleItem[]);
};
