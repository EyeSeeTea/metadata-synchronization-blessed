import { Either } from "../../common/entities/Either";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../entities/Instance";

export class GetInstanceByIdUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    public async execute(id: string): Promise<Either<"NOT_FOUND", Instance>> {
        const instanceRepository = this.repositoryFactory.instanceRepository(this.localInstance);

        const instance = await instanceRepository.getById(id);

        if (!instance) return Either.error("NOT_FOUND");

        return Either.success(instance);
    }
}
