import { generateUid } from "d2/uid";
import { UseCase } from "../../common/entities/UseCase";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { Module } from "../entities/Module";
import { Package, PackageLocation } from "../entities/Package";
import { GitHubRepository } from "../repositories/GitHubRepository";

export class CreatePackageUseCase implements UseCase {
    constructor(
        private storageRepository: StorageRepository,
        private githubRepository: GitHubRepository
    ) {}

    public async execute({ location, module, contents }: CreatePackageOptions): Promise<Package> {
        const payload: Package = {
            location,
            module: module.id,
            revision: "1",
            id: generateUid(),
            contents,
            name: `Package of ${module.name}`,
            author: { name: "Test", email: "test@eyeseetea.com" },
        };

        switch (location) {
            case "dataStore":
                await this.createDataStorePackage(payload);
                break;
            case "github":
                await this.createGitHubPackage(payload);
                break;
            default:
                throw new Error("Unknown location to create package");
        }

        return payload;
    }

    private async createDataStorePackage(payload: Package) {
        await this.storageRepository.saveObjectInCollection(Namespace.PACKAGES, payload, [
            "contents",
        ]);
    }

    private async createGitHubPackage(_payload: Package) {
        // TODO
        console.log(this.githubRepository);
    }
}

export interface CreatePackageOptions {
    location: PackageLocation;
    module: Module;
    contents: MetadataPackage;
}
