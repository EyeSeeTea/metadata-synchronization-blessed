import { DynamicRepositoryFactory } from "../../../common/factories/DynamicRepositoryFactory";
import { Instance } from "../../../instance/entities/Instance";
import { WmrSettings } from "../entities/WmrSettings";

export class GetWmrSettingsUseCase {
    constructor(private repositoryFactory: DynamicRepositoryFactory, private localInstance: Instance) {}

    execute(): Promise<WmrSettings> {
        return this.repositoryFactory.wmrSettingsRepository(this.localInstance).get();
    }
}
