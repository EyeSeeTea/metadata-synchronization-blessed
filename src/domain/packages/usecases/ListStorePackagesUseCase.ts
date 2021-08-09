import _ from "lodash";
import moment from "moment";
import { promiseMap } from "../../../utils/common";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataModule } from "../../modules/entities/MetadataModule";
import { BaseModule } from "../../modules/entities/Module";
import { Store } from "../../stores/entities/Store";
import { GitHubError, GitHubListError } from "../entities/Errors";
import { ListPackage, Package } from "../entities/Package";
import { moduleFile } from "../repositories/GitHubRepository";

export type ListStorePackagesError = GitHubError | "STORE_NOT_FOUND";

export class ListStorePackagesUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(storeId: string): Promise<Either<ListStorePackagesError, ListPackage[]>> {
        const store = await this.repositoryFactory.storeRepository(this.localInstance).getById(storeId);
        if (!store) return Either.error("STORE_NOT_FOUND");

        const validation = await this.repositoryFactory.gitRepository().listBranches(store);
        if (validation.isError()) return Either.error(validation.value.error);

        const branches = validation.value.data?.flatMap(({ name }) => name) ?? [];

        const rawPackages = await promiseMap(branches, branch => this.getPackages(store, branch));
        const packages = _.compact(rawPackages.flatMap(({ value }) => value.data));

        return Either.success(packages);
    }

    private async getPackages(store: Store, userGroup: string): Promise<Either<GitHubListError, Package[]>> {
        const validation = await this.repositoryFactory.gitRepository().listFiles(store, userGroup);

        if (validation.isError()) return Either.error(validation.value.error);

        const files = validation.value.data?.filter(file => file.type === "blob") ?? [];

        const packageFiles = files.filter(file => !file.path.includes(moduleFile));
        const moduleFiles = files.filter(file => file.path.includes(moduleFile));

        const packages = await promiseMap(packageFiles, async ({ path, url }) => {
            const details = this.extractPackageDetailsFromPath(path);
            if (!details) return undefined;

            const { moduleName, name, version, dhisVersion, created } = details;

            const moduleFileUrl =
                moduleFiles.find(file => file.path === `${moduleName}/${moduleFile}`)?.url ?? undefined;
            const module = await this.getModule(store, moduleFileUrl);

            return Package.build({ id: url, name, version, dhisVersion, created, module });
        });

        return Either.success(_.compact(packages));
    }

    private async getModule(store: Store, moduleFileUrl?: string): Promise<BaseModule> {
        const unknownModule = MetadataModule.build({
            id: "Unknown module",
            name: "Unknown module",
        });

        if (!moduleFileUrl) return unknownModule;

        const { encoding, content } = await this.repositoryFactory.gitRepository().request<{
            encoding: string;
            content: string;
        }>(store, moduleFileUrl);

        const readFileResult = this.repositoryFactory.gitRepository().readFileContents<BaseModule>(encoding, content);

        return readFileResult.match({
            success: module => module,
            error: () => unknownModule,
        });
    }

    private extractPackageDetailsFromPath(path: string) {
        const [moduleName, ...fileName] = path.split("/");
        const [name, version, other] = fileName.join("/").split(/(-\d+\.\d+\.\d+-)/);
        if (version && other) {
            const refinedVersion = version.slice(1, -1);
            const tokens = other ? _.compact(other.split("-")) : [];

            if (tokens.length === 2) {
                const [dhisVersion, date] = tokens;

                return {
                    moduleName,
                    name: name,
                    version: refinedVersion,
                    dhisVersion,
                    created: moment(date, "YYYYMMDDHHmm").toDate(),
                };
            } else if (tokens.length === 3) {
                const [versionTag, dhisVersion, date] = tokens;

                return {
                    moduleName,
                    name: name,
                    version: `${refinedVersion}-${versionTag}`,
                    dhisVersion,
                    created: moment(date, "YYYYMMDDHHmm").toDate(),
                };
            } else return null;
        }
    }
}
