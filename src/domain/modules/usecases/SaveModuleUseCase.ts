import _ from "lodash";
import { Namespace } from "../../../data/storage/Namespaces";
import { UseCase } from "../../common/entities/UseCase";
import { ValidationError } from "../../common/entities/Validations";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { UserRepository } from "../../user/repositories/UserRepository";
import { Module } from "../entities/Module";

export class SaveModuleUseCase implements UseCase {
    constructor(
        private repositoryFactory: DynamicRepositoryFactory,
        private userRepository: UserRepository,
        private localInstance: Instance
    ) {}

    public async execute(module: Module): Promise<ValidationError[]> {
        const storageClient = await this.repositoryFactory
            .configRepository(this.localInstance)
            .getStorageClientPromise();

        const validations = module.validate();

        if (validations.length === 0) {
            const user = await this.userRepository.getCurrent();
            const newModule = module.update({
                instance: this.localInstance.url,
                lastUpdated: new Date(),
                lastUpdatedBy: user,
                user: module.user.id ? module.user : { id: user.id, name: user.name },
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

            await storageClient.saveObjectInCollection(Namespace.MODULES, newModule);
        }

        return validations;
    }
}
