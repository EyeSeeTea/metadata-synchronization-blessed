import { PackageTransformationStrategy } from "./D2VersionPackageMapper";
import { MetadataPackage, EventsPackage, AggregatedPackage } from "../../../domain/synchronization/Entities";

export const metadataTransformations: PackageTransformationStrategy<MetadataPackage>[] = [];
export const eventsTransformations: PackageTransformationStrategy<EventsPackage>[] = [];
export const aggregatedTransformations: PackageTransformationStrategy<AggregatedPackage>[] = [];