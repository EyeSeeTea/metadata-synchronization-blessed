import { Transformation } from "../entities/Transformation";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";

export interface TransformationRepositoryConstructor {
    new (): TransformationRepository;
}

export interface TransformationRepository {
    mapPackageTo<Input = MetadataPackage, Output = MetadataPackage>(
        version: number,
        payload: Input,
        transformations: Transformation<Input, Output>[]
    ): Output;

    mapPackageFrom<Input = MetadataPackage, Output = MetadataPackage>(
        version: number,
        payload: Input,
        transformations: Transformation<Input, Output>[]
    ): Output;
}
