import { AggregatedPackage } from "../../domain/aggregated/entities/AggregatedPackage";
import { EventsPackage } from "../../domain/events/entities/EventsPackage";
import { MetadataPackage } from "../../domain/metadata/entities/MetadataEntities";
import { D2AggregatedPackage, D2EventsPackage, D2MetadataPackage } from "./types";
import { Transformation } from "../../domain/common/entities/Transformation";

/**
 * Transformations from domain to dhis2 will be apply consecutively.
 * The transformation lower should transform from domain to dhis2, and consecutive transformations from previous
 * dhis2 version to current dhsi2 versions, example:
 *
 *   [transformation dhis2 v30: domain -> dhis2 v30] -> [transformation dhis2 v31: dhis2 v30 -> dhis2 v31]
 *   -> [transformation dhis2 v32: dhis2 v31 -> dhis2 v32]
 */

// const exampleMetadataTransformationToDhis2 = {
//     apiVersion: 30,
//     transform: (payload: D2MetadataPackage) => {
//         //apply transformations

//         return payload;
//     }
// }

export const metadataTransformationsToDhis2: Transformation<
    MetadataPackage,
    D2MetadataPackage
>[] = [
    //exampleMetadataTransformationToDhis2
];
export const aggregatedTransformationsToDhis2: Transformation<
    AggregatedPackage,
    D2AggregatedPackage
>[] = [];
export const eventsTransformationsToDhis2: Transformation<EventsPackage, D2EventsPackage>[] = [];

/**
 * Transformations from dhis2 to domain will be apply consecutively.
 * The transformation bigger should transform from current dhis2 version to previous dhis2 version until the lower
 * transformation that should transform from current dhis2 version to domain, example:
 *
 *   [transformation dhis2 v32: dhis2 v32 -> dhis2 v31]  -> [transformation dhis2 v31: dhis2 v31 -> dhis2 v30]
 *   -> [transformation dhis2 v30: dhis2 v30 -> domain]
 */

// const exampleMetadataTransformationFromDhis2 =                 {
//     apiVersion: 30,
//     transform: (payload: D2MetadataPackage) => {
//         //apply transformations

//         return payload;
//     }
// }

export const metadataTransformationsFromDhis2: Transformation<
    D2MetadataPackage,
    MetadataPackage
>[] = [
    //exampleMetadataTransformationFromDhis2
];
