import { DataSynchronizationParams } from "../../aggregated/entities/DataSynchronizationParams";
import { UseCase } from "../../common/entities/UseCase";
import { DynamicRepositoryFactory } from "../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../instance/entities/Instance";
import { TEIsResponse } from "../repositories/TEIRepository";

export class ListTEIsUseCase implements UseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, protected localInstance: Instance) {}

    public async execute(
        params: DataSynchronizationParams,
        programs: string,
        instance: Instance,
        page: number,
        pageSize: number
    ): Promise<TEIsResponse> {
        return this.repositoryFactory.teisRepository(instance).getTEIs(params, programs, page, pageSize);
    }
}
