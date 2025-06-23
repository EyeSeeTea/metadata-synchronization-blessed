import moment from "moment";
import { Namespace } from "../../../data/storage/Namespaces";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { BaseModule } from "../../modules/entities/Module";
import { Store } from "../../stores/entities/Store";
import { GitHubError } from "../entities/Errors";
import { BasePackage } from "../entities/Package";
import { GitHubRepository, moduleFile } from "../repositories/GitHubRepository";

export type PublishStorePackageError =
    | GitHubError
    | "DEFAULT_STORE_NOT_FOUND"
    | "PACKAGE_NOT_FOUND"
    | "ALREADY_PUBLISHED";

export class PublishStorePackageUseCase implements UseCase {
    constructor(
        private repositoryFactory: DynamicRepositoryFactory,
        private gitHubRepository: GitHubRepository,
        private localInstance: Instance
    ) {}

    public async execute(packageId: string, force = false): Promise<Either<PublishStorePackageError, void>> {
        const storageClient = await this.repositoryFactory
            .configRepository(this.localInstance)
            .getStorageClientPromise();

        const defaultStore = await this.repositoryFactory.storeRepository(this.localInstance).getDefault();

        if (!defaultStore) return Either.error("DEFAULT_STORE_NOT_FOUND");

        const storedPackage = await storageClient.getObjectInCollection<BasePackage>(Namespace.PACKAGES, packageId);
        if (!storedPackage) return Either.error("PACKAGE_NOT_FOUND");

        const { contents, ...item } = storedPackage;
        const payload = { package: item, ...contents };
        const date = moment(item.created).format("YYYYMMDDHHmm");
        const fileName = [item.name, item.version, item.dhisVersion, date].join("-");
        const path = `${item.module.name}/${fileName}.json`;
        const branch = item.module.department.name.replace(/\s/g, "-");

        const existingFileCheck = await this.gitHubRepository.readFile(defaultStore, branch, path);
        if (existingFileCheck.isSuccess()) return Either.error("ALREADY_PUBLISHED");

        const validation = await this.gitHubRepository.writeFile(
            defaultStore,
            branch,
            path,
            JSON.stringify(payload, null, 4)
        );

        if (validation.isError()) {
            if (force && validation.value.error === "BRANCH_NOT_FOUND") {
                await this.gitHubRepository.createBranch(defaultStore, branch);
                const validation = await this.gitHubRepository.writeFile(
                    defaultStore,
                    branch,
                    path,
                    JSON.stringify(payload, null, 4)
                );

                if (validation.isError()) return Either.error(validation.value.error);
            } else {
                return Either.error(validation.value.error);
            }
        }

        await this.createModuleFileIfRequired(defaultStore, branch, `${item.module.name}/${moduleFile}`, item.module);

        return Either.success(undefined);
    }

    private async createModuleFileIfRequired(
        store: Store,
        branch: string,
        path: string,
        moduleRef: Pick<BaseModule, "id" | "name" | "instance" | "department">
    ) {
        const validation = await this.gitHubRepository.writeFile(
            store,
            branch,
            path,
            JSON.stringify(moduleRef, null, 4)
        );

        if (validation.isError()) {
            return console.warn("An error creating the module file has ocurred");
        }
    }
}
