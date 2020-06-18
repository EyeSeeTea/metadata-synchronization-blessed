export interface DownloadRepository {
    downloadFile(name: string, payload: unknown): void;
}
