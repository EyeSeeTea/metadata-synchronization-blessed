import _ from "lodash";

export interface PackageTransformationStrategy<Input, Output> {
    apiVersion: number;
    transform(payload: Input): Output;
}

/**
 * Apply consecutive transformations to domain package until last transformation found for dhsi2 version
 * if exists transformations for versions 30,31,33 and version argument is 31 then
 * transformations 30 and 31 will be applied
 * @param version version until apply transformations
 * @param payload  payload to trasnform
 * @param transformations list of possible transformations to apply
 */
export function mapPackageToD2Version<Input, Output>(
    d2Version: number,
    payload: Input,
    transformations: PackageTransformationStrategy<unknown, Output>[] = []
): Output {
    const orderedTransformations = _.sortBy(transformations, "version");

    const transformationstoApply = orderedTransformations.filter(
        transformation => transformation.apiVersion <= d2Version
    );

    if (transformationstoApply.length > 0) {
        return transformations.reduce(
            (
                transformedPayload: Output,
                transformation: PackageTransformationStrategy<unknown, Output>
            ) => transformation.transform(transformedPayload),
            {} as Output
        );
    } else {
        console.log(`No transformations applied to package for dhis2 web api version ${d2Version}`);
        return (payload as unknown) as Output;
    }
}
