import { DhisRelease } from "../entities/DhisRelease";

export interface DhisReleasesRepository {
    getAllSupportedVersions(): Promise<DhisRelease[]>;
}
