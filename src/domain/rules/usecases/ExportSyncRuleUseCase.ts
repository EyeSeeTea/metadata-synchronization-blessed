import { promiseMap } from "../../../utils/common";
import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";
import { Instance } from "../../instance/entities/Instance";

export class ExportSyncRuleUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory, private localInstance: Instance) {}

    public async execute(ids: string[]): Promise<void> {
        const rules = await promiseMap(ids, id =>
            this.repositoryFactory.rulesRepository(this.localInstance).getById(id)
        );
        console.log("export", rules);
    }
}
