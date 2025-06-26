import { UseCase } from "../../common/entities/UseCase";
import { DownloadRepository } from "../repositories/DownloadRepository";

export class DownloadFileUseCase implements UseCase {
    constructor(private downloadRepository: DownloadRepository) {}

    public async execute(name: string, file: unknown) {
        return this.downloadRepository.downloadFile(name, file);
    }
}
