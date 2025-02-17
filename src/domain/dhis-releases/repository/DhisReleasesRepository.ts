import { DhisRelease } from "../entities/DhisRelease";

export interface DhisReleasesRepositoryConstructor {
    new (): DhisReleasesRepository;
}

export interface DhisReleasesRepository {
    getAllSupportedVersions(): Promise<DhisRelease[]>;
}
