import { MetadataPackageSchema } from "../../domain/metadata/entities";

export type D2MetadataPackage = Partial<Record<keyof MetadataPackageSchema, any[]>>;

export type D2AggregatedPackage = {
    dataValues: any[];
}

export type D2EventsPackage = {
    events: any[];
}