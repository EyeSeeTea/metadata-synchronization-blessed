import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { StoreRepository } from "../repositories/StoreRepository";

type SetStoreAsDefaultError = {
    kind: "SetStoreAsDefaultError";
};

export class SetStoreAsDefaultUseCase implements UseCase {
    constructor(private storeRepository: StoreRepository) {}

    public async execute(id: string): Promise<Either<SetStoreAsDefaultError, void>> {
        try {
            await this.storeRepository.setDefault(id);
            return Either.success(undefined);
        } catch {
            return Either.error({
                kind: "SetStoreAsDefaultError",
            });
        }
    }
}
