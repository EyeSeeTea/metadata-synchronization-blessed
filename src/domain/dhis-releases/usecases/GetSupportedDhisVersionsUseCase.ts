import { DhisRelease } from "../entities/DhisRelease";
import { DhisReleasesRepository } from "../repository/DhisReleasesRepository";

export class GetSupportedDhisVersionsUseCase {
    constructor(private dhisReleaseRepository: DhisReleasesRepository) {}

    async execute(): Promise<DhisRelease[]> {
        return this.dhisReleaseRepository.getAllSupportedVersions();
    }
}
