import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../entities/Instance";

export class GetInstanceByIdUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string): Promise<Either<"NOT_FOUND", Instance>> {
        const instanceRepository = this.repositoryFactory.instanceRepository(this.localInstance);

        const instance = await instanceRepository.getById(id);

        if (!instance) return Either.error("NOT_FOUND");

        return Either.success(instance);
    }
}
