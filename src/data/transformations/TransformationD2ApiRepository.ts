import { TransformationRepository } from "../../domain/common/repositories/TransformationRepository";
import { Transformation } from "../../domain/common/entities/Transformation";
import _ from "lodash";

export class TransformationD2ApiRepository implements TransformationRepository {
    /**
     * Apply consecutive transformations to domain package until bigger version transformation found for dhis2 version
     * if exists transformations for versions 30,31,33 and version argument is 31 then
     * transformations 30 and 31 will be applied
     * @param version version until apply transformations
     * @param payload  payload to transform
     * @param transformations list of possible transformations to apply
     */
    public mapPackageTo<Input, Output>(
        d2Version: number,
        payload: Input,
        transformations: Transformation<unknown, Output>[] = []
    ): Output {
        const transformationstoApply = _.orderBy(transformations, ["apiVersion"]).filter(
            transformation => transformation.apiVersion <= d2Version
        );

        if (transformationstoApply.length > 0) {
            return this.applyTransformations<Input, Output>(payload, transformationstoApply);
        } else {
            console.log(
                `No transformations applied from domain to dhis2 metadata package in version ${d2Version}`
            );
            return (payload as unknown) as Output;
        }
    }

    /**
     * Apply consecutive transformations to dhis2 package until lower version transformation found for dhis2 version that
     * transform to domain metadata package
     * if exists transformations for versions 30,31,33 and version argument is 31 then
     * transformations 30 and 31 will be applied
     * @param version version until apply transformations
     * @param payload  payload to transform
     * @param transformations list of possible transformations to apply
     */
    public mapPackageFrom<Input, Output>(
        d2Version: number,
        payload: Input,
        transformations: Transformation<unknown, Output>[] = []
    ): Output {
        const transformationstoApply = _.orderBy(transformations, ["apiVersion"], ["desc"]).filter(
            transformation => transformation.apiVersion <= d2Version
        );

        if (transformationstoApply.length > 0) {
            return this.applyTransformations<Input, Output>(payload, transformationstoApply);
        } else {
            console.log(
                `No transformations applied from dhis2 to domain metadata package in version ${d2Version}`
            );
            return (payload as unknown) as Output;
        }
    }

    private applyTransformations<Input, Output>(
        payload: Input,
        transformations: Transformation<unknown, Output>[]
    ): Output {
        return transformations.reduce(
            (transformedPayload: Output, transformation: Transformation<unknown, Output>) =>
                transformation.transform(transformedPayload),
            (payload as unknown) as Output
        );
    }
}
