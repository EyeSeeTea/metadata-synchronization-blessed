import { Transformation } from "../entities/Transformation";

export interface TransformationRepositoryConstructor {
    new (): TransformationRepository;
}

export interface TransformationRepository {
    mapPackageTo<Input, Output>(
        version: number,
        payload: Input,
        transformations: Transformation<unknown, Output>[]
    ): Output;

    mapPackageFrom<Input, Output>(
        version: number,
        payload: Input,
        transformations: Transformation<unknown, Output>[]
    ): Output;
}
