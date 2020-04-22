import { MetadataPackage } from "../types/synchronization";
import _ from "lodash";

export interface MetadataTransformationStrategy {
    version: number;
    transform(payload: MetadataPackage): MetadataPackage
}

/**
 * Apply consecutive transformations to domain package until last transformation found for dhsi2 version
 * if exists transformations for versions 30,31,33 and version argument is 31 then
 * transformations 30 and 31 will be applied
 * @param version version until apply transformations
 * @param payload  payload to trasnform
 * @param transformations list of possible transformations to apply
 */
export function mapPackage(d2Version: number, payload: MetadataPackage,
    transformations: MetadataTransformationStrategy[] = []): MetadataPackage {
    const orderedTransformations = _.sortBy(transformations, 'version');

    const transformationstoApply = orderedTransformations.filter(
        transformation => transformation.version <= d2Version);

    if (transformationstoApply.length > 0) {
        return transformations.reduce(
            (transformedPayload: MetadataPackage, transformation: MetadataTransformationStrategy) =>
                transformation.transform(transformedPayload), payload);
    } else {
        console.log(`No transformations applied to package for dhis2 version ${d2Version}`)
        return payload;
    }
}

