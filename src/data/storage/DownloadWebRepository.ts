import FileSaver from "file-saver";
import { DownloadRepository } from "../../domain/storage/repositories/DownloadRepository";

export class DownloadWebRepository implements DownloadRepository {
    public downloadFile(name: string, payload: unknown): void {
        const json = JSON.stringify(payload, null, 4);
        const blob = new Blob([json], { type: "application/json" });
        FileSaver.saveAs(blob, name);
    }
}
