import { UseCase } from "../../common/entities/UseCase";
import { RepositoryByInstanceFactory } from "../../common/factories/RepositoryFactory";

export class DownloadFileUseCase implements UseCase {
    constructor(private repositoryFactory: RepositoryByInstanceFactory) {}

    public async execute(name: string, file: unknown) {
        return this.repositoryFactory.downloadRepository().downloadFile(name, file);
    }
}
