import { AggregatedPackage } from "../../aggregated/entities/AggregatedPackage";
import { EventsPackage } from "../../events/entities/EventsPackage";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { TEIsPackage } from "../../tracked-entity-instances/entities/TEIsPackage";

export type SynchronizationPayload = MetadataPackage | AggregatedPackage | EventsPackage | TEIsPackage;
