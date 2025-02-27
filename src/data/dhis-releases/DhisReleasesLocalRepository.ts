import _ from "lodash";
import { DhisRelease } from "../../domain/dhis-releases/entities/DhisRelease";
import { DhisReleasesRepository } from "../../domain/dhis-releases/repository/DhisReleasesRepository";
import { cache } from "../../utils/cache";

export class DhisReleasesLocalRepository implements DhisReleasesRepository {
    @cache()
    getAllSupportedVersions(): Promise<DhisRelease[]> {
        const MAJOR_VERSION = 2;
        const MIN_MINOR_VERSION = 30;
        const MAX_MINOR_VERSION = 41;
        const versions = _.range(MIN_MINOR_VERSION, MAX_MINOR_VERSION + 1).map(minor => `${MAJOR_VERSION}.${minor}`);
        return Promise.resolve(versions);
    }
}
