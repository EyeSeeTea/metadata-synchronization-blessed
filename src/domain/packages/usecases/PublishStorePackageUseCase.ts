import moment from "moment";
import { cache } from "../../../utils/cache";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { BaseModule } from "../../modules/entities/Module";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { GitHubError } from "../entities/Errors";
import { BasePackage } from "../entities/Package";
import { Store } from "../entities/Store";
import { GitHubRepositoryConstructor, moduleFile } from "../repositories/GitHubRepository";

export type PublishStorePackageError =
    | GitHubError
    | "DEFAULT_STORE_NOT_FOUND"
    | "PACKAGE_NOT_FOUND"
    | "ALREADY_PUBLISHED";

export class PublishStorePackageUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(
        packageId: string,
        force = false
    ): Promise<Either<PublishStorePackageError, void>> {
        const store = (
            await this.storageRepository(this.localInstance).getObject<Store[]>(Namespace.STORES)
        )?.find(store => store.default && !store.deleted);

        if (!store) return Either.error("DEFAULT_STORE_NOT_FOUND");

        const storedPackage = await this.storageRepository(
            this.localInstance
        ).getObjectInCollection<BasePackage>(Namespace.PACKAGES, packageId);
        if (!storedPackage) return Either.error("PACKAGE_NOT_FOUND");

        const { contents, ...item } = storedPackage;
        const payload = { package: item, ...contents };
        const date = moment(item.created).format("YYYYMMDDHHmm");
        const fileName = [item.name, item.version, item.dhisVersion, date].join("-");
        const path = `${item.module.name}/${fileName}.json`;
        const branch = item.module.department.name.replace(/\s/g, "-");

        const existingFileCheck = await this.gitRepository().readFile(store, branch, path);
        if (existingFileCheck.isSuccess()) return Either.error("ALREADY_PUBLISHED");

        const validation = await this.gitRepository().writeFile(
            store,
            branch,
            path,
            JSON.stringify(payload, null, 4)
        );

        if (validation.isError()) {
            if (force && validation.value.error === "BRANCH_NOT_FOUND") {
                await this.gitRepository().createBranch(store, branch);
                const validation = await this.gitRepository().writeFile(
                    store,
                    branch,
                    path,
                    JSON.stringify(payload, null, 4)
                );

                if (validation.isError()) return Either.error(validation.value.error);
            } else {
                return Either.error(validation.value.error);
            }
        }

        await this.createModuleFileIfRequired(
            store,
            branch,
            `${item.module.name}/${moduleFile}`,
            item.module
        );

        return Either.success(undefined);
    }

    private async createModuleFileIfRequired(
        store: Store,
        branch: string,
        path: string,
        moduleRef: Pick<BaseModule, "id" | "name" | "instance" | "department">
    ) {
        const validation = await this.gitRepository().writeFile(
            store,
            branch,
            path,
            JSON.stringify(moduleRef, null, 4)
        );

        if (validation.isError()) {
            return console.warn("An error creating the module file has ocurred");
        }
    }

    @cache()
    private gitRepository() {
        return this.repositoryFactory.get<GitHubRepositoryConstructor>(
            Repositories.GitHubRepository,
            []
        );
    }

    @cache()
    private storageRepository(instance: Instance) {
        return this.repositoryFactory.get<StorageRepositoryConstructor>(
            Repositories.StorageRepository,
            [instance]
        );
    }
}
