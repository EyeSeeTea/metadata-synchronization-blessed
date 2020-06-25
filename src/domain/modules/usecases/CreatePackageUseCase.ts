import { UseCase } from "../../common/entities/UseCase";
import { ValidationError } from "../../common/entities/Validations";
import { InstanceRepository } from "../../instance/repositories/InstanceRepository";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { Package } from "../entities/Package";

export class CreatePackageUseCase implements UseCase {
    constructor(
        private storageRepository: StorageRepository,
        private instanceRepository: InstanceRepository
    ) {}

    public async execute(payload: Package): Promise<ValidationError[]> {
        const validations = payload.validate();

        if (validations.length === 0) {
            const user = await this.instanceRepository.getUser();
            const newPackage = payload.update({
                lastUpdated: new Date(),
                lastUpdatedBy: user,
                user: payload.user.id ? payload.user : user,
            });

            await this.storageRepository.saveObjectInCollection(Namespace.PACKAGES, newPackage, [
                "contents",
            ]);
        }

        return validations;
    }
}
