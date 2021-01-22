export interface DownloadRepositoryConstructor {
    new (): DownloadRepository;
}

export interface DownloadItem {
    name: string;
    content: unknown;
}

export interface DownloadRepository {
    downloadFile(name: string, payload: unknown): void;
    downloadZippedFiles(name: string, items: DownloadItem[]): Promise<void>;
}
