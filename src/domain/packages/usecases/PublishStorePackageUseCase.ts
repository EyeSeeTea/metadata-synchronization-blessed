import moment from "moment";
import { cache } from "../../../utils/cache";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { GitHubError } from "../entities/Errors";
import { BasePackage } from "../entities/Package";
import { Store } from "../entities/Store";
import { GitHubRepositoryConstructor } from "../repositories/GitHubRepository";

export type PublishStorePackageError = GitHubError | "STORE_NOT_FOUND" | "PACKAGE_NOT_FOUND";

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

        const { name, version, dhisVersion, created, module, contents } = storedPackage;
        const payload = { package: storedPackage, ...contents };
        const date = moment(created).format("YYYYMMDDHHmm");
        const fileName = [name, version, dhisVersion, date].join("-");
        const path = `${module.name}/${fileName}.json`;
        const branch = module.department.name.replace(/\s/g, "-");

        const validation = await this.gitRepository().writeFile(
            store,
            branch,
            path,
            JSON.stringify(payload, null, 4)
        );

        if (validation.isError()) return Either.error(validation.value.error);

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
