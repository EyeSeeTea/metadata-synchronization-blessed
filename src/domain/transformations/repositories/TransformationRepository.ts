import { Transformation } from "../entities/Transformation";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";

export interface TransformationRepository {
    mapPackageTo<Input = MetadataPackage, Output = MetadataPackage>(
        destination: number,
        payload: Input,
        transformations: Transformation[],
        origin?: number
    ): Output;

    mapPackageFrom<Input = MetadataPackage, Output = MetadataPackage>(
        origin: number,
        payload: Input,
        transformations: Transformation[],
        destination?: number
    ): Output;
}
