import { UseCase } from "../../common/entities/UseCase";
import { DataSource } from "../../instance/entities/DataSource";
import { GenericMappingUseCase } from "./GenericMappingUseCase";

export class GetValidMappingIdUseCase extends GenericMappingUseCase implements UseCase {
    public async execute(instance: DataSource, id: string): Promise<string[]> {
        return this.getValidMappingIds(instance, id);
    }
}
