import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";

type SetStoreAsDefaultError = {
    kind: "SetStoreAsDefaultError";
};

export class SetStoreAsDefaultUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string): Promise<Either<SetStoreAsDefaultError, void>> {
        try {
            await this.repositoryFactory.storeRepository(this.localInstance).setDefault(id);
            return Either.success(undefined);
        } catch {
            return Either.error({
                kind: "SetStoreAsDefaultError",
            });
        }
    }
}
