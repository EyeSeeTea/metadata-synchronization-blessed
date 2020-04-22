import { PackageTransformationStrategy } from "./D2VersionPackageMapper";
import { MetadataPackage, EventsPackage, AggregatedPackage } from "../../../types/synchronization";

export const metadataTransformations: PackageTransformationStrategy<MetadataPackage>[] = [];
export const eventsTransformations: PackageTransformationStrategy<EventsPackage>[] = [];
export const aggregatedTransformations: PackageTransformationStrategy<AggregatedPackage>[] = [];