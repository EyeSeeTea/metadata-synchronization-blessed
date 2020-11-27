export interface MappingOwnerStore {
    type: "store";
    id: string;
    moduleId: string;
}

export interface MappingOwnerInstance {
    type: "instance";
    id: string;
}

export interface MappingOwnerPackage {
    type: "package";
    id: string;
}

export type MappingOwner = MappingOwnerStore | MappingOwnerInstance | MappingOwnerPackage;

export const isMappingOwnerStore = (source: MappingOwner): source is MappingOwnerStore => {
    return source.type === "store";
};

export const isMappingOwnerInstance = (source: MappingOwner): source is MappingOwnerInstance => {
    return source.type === "instance";
};

export type MappingOwnerType = "instance" | "store" | "package";
