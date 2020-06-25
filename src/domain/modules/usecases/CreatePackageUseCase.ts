import { generateUid } from "d2/uid";
import { UseCase } from "../../common/entities/UseCase";
import { InstanceRepository } from "../../instance/repositories/InstanceRepository";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { Package } from "../entities/Package";

export class CreatePackageUseCase implements UseCase {
    constructor(
        private storageRepository: StorageRepository,
        private instanceRepository: InstanceRepository
    ) {}

    public async execute({
        name,
        description,
        module,
        contents,
        version,
        dhisVersion,
    }: CreatePackageOptions): Promise<Package> {
        const user = await this.instanceRepository.getUser();
        const payload: Package = {
            module,
            version,
            id: generateUid(),
            contents,
            description,
            name,
            dhisVersion,
            created: new Date(),
            lastUpdated: new Date(),
            lastUpdatedBy: user,
            user: user,
        };

        await this.storageRepository.saveObjectInCollection(Namespace.PACKAGES, payload, [
            "contents",
        ]);

        return payload;
    }
}

export type CreatePackageOptions = Pick<
    Package,
    "name" | "description" | "version" | "dhisVersion" | "module" | "contents"
>;
