import _ from "lodash";
import { Transformation } from "../../domain/transformations/entities/Transformation";
import { TransformationRepository } from "../../domain/transformations/repositories/TransformationRepository";
import { API_VERSION } from "../../types/d2-api";

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
        destination: number,
        payload: Input,
        transformations: Transformation[] = []
    ): Output {
        const transformationstoApply = _.orderBy(transformations, ["apiVersion"]).filter(
            ({ apiVersion }) => apiVersion <= destination && apiVersion > API_VERSION
        );

        if (transformationstoApply.length > 0) {
            return this.applyTransformations<Input, Output>(payload, transformationstoApply);
        } else {
            console.debug(
                `No transformations applied from domain to dhis2 metadata package in version ${destination}`
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
        origin: number,
        payload: Input,
        transformations: Transformation[] = []
    ): Output {
        const transformationstoApply = _.orderBy(transformations, ["apiVersion"], ["desc"]).filter(
            ({ apiVersion }) => apiVersion <= origin && apiVersion > API_VERSION
        );

        if (transformationstoApply.length > 0) {
            return this.undoTransformations<Input, Output>(payload, transformationstoApply);
        } else {
            /*
            console.debug(
                `No transformations applied from dhis2 to domain metadata package in version ${origin}`
            );
            */
            return (payload as unknown) as Output;
        }
    }

    private applyTransformations<Input, Output>(
        payload: Input,
        transformations: Transformation[]
    ): Output {
        return transformations.reduce(
            (transformedPayload: Output, transformation: Transformation) =>
                transformation.apply
                    ? transformation.apply<unknown, Output>(transformedPayload)
                    : transformedPayload,
            (payload as unknown) as Output
        );
    }

    private undoTransformations<Input, Output>(
        payload: Input,
        transformations: Transformation[]
    ): Output {
        return transformations.reduce(
            (transformedPayload: Output, transformation: Transformation) =>
                transformation.undo
                    ? transformation.undo<unknown, Output>(transformedPayload)
                    : transformedPayload,
            (payload as unknown) as Output
        );
    }
}
