import { generateUid } from "d2/uid";
import { UseCase } from "../../common/entities/UseCase";
import { ValidationError } from "../../common/entities/Validations";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { InstanceRepositoryConstructor } from "../../instance/repositories/InstanceRepository";
import { Module } from "../../modules/entities/Module";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { Package } from "../entities/Package";

export class CreatePackageUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(payload: Package, module: Module): Promise<ValidationError[]> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [this.localInstance]
        );

        const instanceRepository = this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [this.localInstance, ""]
        );

        const validations = payload.validate();

        if (validations.length === 0) {
            const user = await instanceRepository.getUser();
            const newPackage = payload.update({
                id: generateUid(),
                lastUpdated: new Date(),
                lastUpdatedBy: user,
                user: payload.user.id ? payload.user : user,
            });

            await storageRepository.saveObjectInCollection(
                Namespace.PACKAGES,
                newPackage,
                Package.extendedFields
            );

            const newModule = module.update({ lastPackageVersion: newPackage.version });
            await storageRepository.saveObjectInCollection(Namespace.MODULES, newModule);
        }

        return validations;
    }
}
