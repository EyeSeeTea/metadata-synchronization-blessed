import { cache } from "../../../utils/cache";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { BasePackage } from "../entities/Package";
import { Store } from "../entities/Store";
import { GitHubRepositoryConstructor } from "../repositories/GitHubRepository";

export type PublishStorePackageError = "STORE_NOT_FOUND" | "PACKAGE_NOT_FOUND" | "MODULE_NOT_FOUND";

export class PublishStorePackageUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(packageId: string): Promise<Either<PublishStorePackageError, void>> {
        const store = await this.storageRepository(this.localInstance).getObject<Store>(
            Namespace.STORE
        );
        if (!store) return Either.error("STORE_NOT_FOUND");

        const storedPackage = await this.storageRepository(
            this.localInstance
        ).getObjectInCollection<BasePackage>(Namespace.PACKAGES, packageId);
        if (!storedPackage) return Either.error("PACKAGE_NOT_FOUND");

        const { name, version, dhisVersion, user, created, module, contents } = storedPackage;
        const fileName = [name, version, dhisVersion, user, created].join("-");
        const path = `${module.name}/${fileName}`;

        const validation = await this.gitRepository().writeFile(
            store,
            module.department.name,
            path,
            contents
        );

        console.log("DEBUG", validation);

        return Either.success(undefined);
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
