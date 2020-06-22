import { UseCase } from "../../common/entities/UseCase";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepository } from "../../storage/repositories/StorageRepository";
import { Package, PackageLocation } from "../entities/Package";
import { GitHubRepository } from "../repositories/GitHubRepository";

export class ListPackagesUseCase implements UseCase {
    constructor(
        private storageRepository: StorageRepository,
        private githubRepository: GitHubRepository
    ) {}

    public async execute(filters: ListPackagesFilters = {}): Promise<Package[]> {
        return [
            ...(await this.loadDataStorePackages(filters)),
            ...(await this.loadGitHubPackages(filters)),
        ];
    }

    private async loadDataStorePackages({ locations = ["dataStore"] }: ListPackagesFilters) {
        if (!locations.includes("dataStore")) return [];

        return this.storageRepository.listObjectsInCollection<Package>(Namespace.PACKAGES);
    }

    private async loadGitHubPackages({ locations = ["github"] }: ListPackagesFilters) {
        if (!locations.includes("github")) return [];
        console.log(this.githubRepository);

        return [];
    }
}

export interface ListPackagesFilters {
    locations?: PackageLocation[];
}
