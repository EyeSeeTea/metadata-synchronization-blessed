import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { Package } from "../entities/Package";

export class ListPackagesUseCase implements UseCase {
    constructor(private storageRepository: StorageRepository) {}

    public async execute(): Promise<Package[]> {
        const items = await this.storageRepository.listObjectsInCollection<Package>(
            Namespace.PACKAGES
        );

        return items.filter(({ deleted }) => !deleted);
    }
}
