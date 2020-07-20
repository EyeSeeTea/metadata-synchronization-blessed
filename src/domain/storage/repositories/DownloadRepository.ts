export interface DownloadRepositoryConstructor {
    new (): DownloadRepository;
}

export interface DownloadRepository {
    downloadFile(name: string, payload: unknown): void;
}
