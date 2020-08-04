import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { BasePackage, Package } from "../entities/Package";

export class GetPackageUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository) {}

    public async execute(id: string): Promise<Either<"NOT_FOUND", Package>> {
        const data = await this.storageRepository.getObjectInCollection<BasePackage>(
            Namespace.PACKAGES,
            id
        );

        if (data) return Either.success(Package.build(data));
        else return Either.error("NOT_FOUND");
    }
}
