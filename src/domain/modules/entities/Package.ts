import { DatedRef } from "../../common/entities/Ref";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { Module } from "./Module";

export type BasePackage = Omit<Package, "contents">;

export interface Package extends DatedRef {
    description: string;
    version: string;
    dhisVersion: string;
    module: Pick<Module, "id" | "name" | "instance">;
    contents: MetadataPackage;
}
