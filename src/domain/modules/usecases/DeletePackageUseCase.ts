import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { PackageLocation } from "../entities/Package";
import { GitHubRepository } from "../repositories/GitHubRepository";

export class DeletePackageUseCase implements UseCase {
    constructor(
        private storageRepository: StorageRepository,
        private githubRepository: GitHubRepository
    ) {}

    public async execute(location: PackageLocation, id: string): Promise<Boolean> {
        try {
            switch (location) {
                case "dataStore":
                    await this.deleteDataStorePackage(id);
                    break;
                case "github":
                    await this.deleteGitHubPackage(id);
                    break;
                default:
                    throw new Error("Unknown location to create package");
            }
        } catch (error) {
            return false;
        }

        return true;
    }

    private async deleteDataStorePackage(id: string) {
        await this.storageRepository.removeObjectInCollection(Namespace.PACKAGES, id);
    }

    private async deleteGitHubPackage(_id: string) {
        // TODO
        console.log(this.githubRepository);
    }
}
