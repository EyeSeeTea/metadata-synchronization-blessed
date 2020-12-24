import { UseCase } from "../../common/entities/UseCase";
import { RepositoryFactory } from "../../common/factories/RepositoryFactory";

export class DownloadFileUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryFactory) {}

    public async execute(name: string, file: unknown) {
        return this.repositoryFactory.downloadRepository().downloadFile(name, file);
    }
}
