import _ from "lodash";
import { cache } from "../../../utils/cache";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { Repositories } from "../../Repositories";
import { Namespace } from "../../storage/Namespaces";
import { StorageRepositoryConstructor } from "../../storage/repositories/StorageRepository";
import { BasePackage, Package } from "../entities/Package";
import { Store } from "../entities/Store";
import { GitHubRepositoryConstructor } from "../repositories/GitHubRepository";

export class GetStorePackageUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(
        storeId: string,
        packageId: string
    ): Promise<Either<"NOT_FOUND", Package>> {
        const store = (
            await this.storageRepository(this.localInstance).getObject<Store[]>(Namespace.STORES)
        )?.find(store => store.id === storeId);

        if (!store) return Either.error("NOT_FOUND");

        const { encoding, content } = await this.gitRepository().request<{
            encoding: string;
            content: string;
        }>(store, packageId);

        const readFileResult = this.gitRepository().readFileContents<
            MetadataPackage & { package: BasePackage }
        >(encoding, content);

        if (readFileResult.isError()) return Either.error("NOT_FOUND");

        const basePackage = readFileResult.value.data?.package;
        const contents = _.omit(readFileResult.value.data, "package");

        const packageToReturn = Package.build({ ...basePackage, contents });

        return Either.success(packageToReturn);
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
