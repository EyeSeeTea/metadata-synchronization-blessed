import { PackageTransformationStrategy } from "./D2VersionPackageMapper";
import { EventsPackage, AggregatedPackage } from "../../../domain/synchronization/DataEntities";
import { MetadataPackage } from "../../../domain/synchronization/MetadataEntities";

export const metadataTransformations: PackageTransformationStrategy<MetadataPackage>[] = [];
export const eventsTransformations: PackageTransformationStrategy<EventsPackage>[] = [];
export const aggregatedTransformations: PackageTransformationStrategy<AggregatedPackage>[] = [];