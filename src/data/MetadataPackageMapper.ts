import { MetadataPackage } from "../types/synchronization";

const metadataTransformations: MetadataTransformationStrategy[] = [
    // Add here transformations
];

export interface MetadataTransformationStrategy {
    version: number;
    transform(payload: MetadataPackage): MetadataPackage
}

export function mapPackage(version: number, payload: MetadataPackage,
    transformations: MetadataTransformationStrategy[] = metadataTransformations): MetadataPackage {
    const transformationstoApply = transformations.filter(mapper => mapper.version > version);

    if (transformationstoApply) {
        let transformedPayload = payload;

        transformationstoApply.forEach(transformation =>
            transformedPayload = transformation.transform(payload));

        return transformedPayload;
    } else {
        console.log(`No transformations applied to package for dhis2 version ${version}`)
        return payload;
    }
}

