import _ from "lodash";
import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { MetadataPackage } from "../../metadata/entities/MetadataEntities";
import { BasePackage, Package } from "../entities/Package";

export class GetStorePackageUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(storeId: string, packageId: string): Promise<Either<"NOT_FOUND", Package>> {
        const store = await this.repositoryFactory.storeRepository(this.localInstance).getById(storeId);
        if (!store) return Either.error("NOT_FOUND");

        const { encoding, content } = await this.repositoryFactory.gitRepository().request<{
            encoding: string;
            content: string;
        }>(store, packageId);

        const readFileResult = this.repositoryFactory
            .gitRepository()
            .readFileContents<MetadataPackage & { package: BasePackage }>(encoding, content);

        if (readFileResult.isError()) return Either.error("NOT_FOUND");

        const basePackage = readFileResult.value.data?.package;
        const contents = _.omit(readFileResult.value.data, "package");

        const packageToReturn = Package.build({ ...basePackage, contents });

        return Either.success(packageToReturn);
    }
}
