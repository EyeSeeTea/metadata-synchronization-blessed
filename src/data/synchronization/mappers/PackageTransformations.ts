import { PackageTransformationStrategy } from "./D2VersionPackageMapper";
import { D2MetadataPackage, D2AggregatedPackage, D2EventsPackage } from "../types";
import { AggregatedPackage, EventsPackage } from "../../../domain/synchronization/DataEntities";
import { MetadataPackage } from "../../../domain/metadata/entities";

export const metadataTransformationsToDhis2: PackageTransformationStrategy<MetadataPackage, D2MetadataPackage>[] = [];
export const aggregatedTransformationsToDhis2: PackageTransformationStrategy<AggregatedPackage, D2AggregatedPackage>[] = [];
export const eventsTransformationsToDhis2: PackageTransformationStrategy<EventsPackage, D2EventsPackage>[] = [];
