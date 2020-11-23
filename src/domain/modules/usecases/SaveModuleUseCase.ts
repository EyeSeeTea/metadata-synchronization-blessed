import _ from "lodash";
import { UseCase } from "../../common/entities/UseCase";
import { ValidationError } from "../../common/entities/Validations";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { InstanceRepositoryConstructor } from "../../instance/repositories/InstanceRepository";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageClient";
import { Module } from "../entities/Module";

export class SaveModuleUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(module: Module): Promise<ValidationError[]> {
        const storageRepository = this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [this.localInstance]
        );

        const instanceRepository = this.repositoryFactory.get<InstanceRepositoryConstructor>(
            Repositories.InstanceRepository,
            [this.localInstance, ""]
        );

        const validations = module.validate();

        if (validations.length === 0) {
            const user = await instanceRepository.getUser();
            const newModule = module.update({
                instance: instanceRepository.getBaseUrl(),
                lastUpdated: new Date(),
                lastUpdatedBy: user,
                user: module.user.id ? module.user : user,
                userGroupAccesses: _.unionBy(
                    module.userGroupAccesses,
                    [
                        {
                            ...module.department,
                            displayName: module.department.name,
                            access: "rw----",
                        },
                    ],
                    "id"
                ),
            });

            await storageRepository.saveObjectInCollection(Namespace.MODULES, newModule);
        }

        return validations;
    }
}
