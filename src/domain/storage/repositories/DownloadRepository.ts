import { TransformationRepository } from "../../transformations/repositories/TransformationRepository";

export interface DownloadRepositoryConstructor {
    new (transformationRepository: TransformationRepository): DownloadRepository;
}
export interface DownloadItem {
    name: string;
    content: unknown;
    apiVersion?: number;
}

export interface DownloadRepository {
    downloadFile(name: string, payload: unknown, apiVersion?: number): void;
    downloadZippedFiles(name: string, items: DownloadItem[]): Promise<void>;
}
