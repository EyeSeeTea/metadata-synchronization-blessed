import { UseCase } from "../../common/entities/UseCase";
import { ListMetadataParams, MetadataRepository } from "../repositories/MetadataRepository";

export class ListAllMetadataUseCase implements UseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    public async execute(params: ListMetadataParams) {
        return this.metadataRepository.listAllMetadata(params);
    }
}
