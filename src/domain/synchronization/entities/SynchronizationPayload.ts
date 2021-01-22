import { AggregatedPackage } from "../../aggregated/entities/AggregatedPackage";
import { EventsPackage } from "../../events/entities/EventsPackage";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";

export type SynchronizationPayload = MetadataPackage | AggregatedPackage | EventsPackage;
