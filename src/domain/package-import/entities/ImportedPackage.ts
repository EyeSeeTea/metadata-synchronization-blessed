import { generateUid } from "d2/uid";
import { NamedRef, Ref } from "../../common/entities/Ref";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";

export type ImportedPackageType = "STORE" | "INSTANCE";

export interface ImportedPackageData extends Ref {
    type: ImportedPackageType;
    remoteId: string;
    url?: string;
    module: NamedRef;
    package: NamedRef;
    version: string;
    dhisVersion: string;
    date: Date;
    author: NamedRef;
    contents: MetadataPackage;
}

export type ListImportedPackage = Omit<ImportedPackageData, "contents">;

export class ImportedPackage implements ImportedPackageData {
    public readonly id: string;
    public readonly type: ImportedPackageType;
    public readonly remoteId: string;
    public readonly url?: string;
    public readonly module: NamedRef;
    public readonly package: NamedRef;
    public readonly version: string;
    public readonly dhisVersion: string;
    public readonly date: Date;
    public readonly author: NamedRef;
    public readonly contents: MetadataPackage;

    constructor(data: ImportedPackageData) {
        this.id = data.id;
        this.type = data.type;
        this.remoteId = data.remoteId;
        this.url = data.url;
        this.module = data.module;
        this.package = data.package;
        this.version = data.version;
        this.dhisVersion = data.dhisVersion;
        this.date = data.date;
        this.author = data.author;
        this.contents = data.contents;
    }

    public static create(data: Omit<ImportedPackageData, "id" | "date">): ImportedPackage {
        const id = generateUid();
        const date = new Date();

        return new ImportedPackage({ ...data, id, date });
    }

    public static build(data: ImportedPackageData): ImportedPackage {
        return new ImportedPackage({ ...data });
    }
}
