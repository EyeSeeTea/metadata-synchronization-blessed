import { UseCase } from "../../common/entities/UseCase";
import { MetadataRepository } from "../repositories/MetadataRepository";

export class ListMetadataUseCase implements UseCase {
    constructor(private metadataRepository: MetadataRepository) {}

    public async execute() {
        console.log(this.metadataRepository);
        return [];
    }
}
