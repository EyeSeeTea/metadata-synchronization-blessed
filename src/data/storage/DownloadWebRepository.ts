import FileSaver from "file-saver";
import JSZip from "jszip";
import {
    DownloadItem,
    DownloadRepository,
} from "../../domain/storage/repositories/DownloadRepository";

export class DownloadWebRepository implements DownloadRepository {
    public downloadFile(name: string, payload: unknown): void {
        const json = JSON.stringify(payload, null, 4);
        const blob = new Blob([json], { type: "application/json" });
        FileSaver.saveAs(blob, name);
    }

    public async downloadZippedFiles(name: string, items: DownloadItem[]): Promise<void> {
        const zip = new JSZip();

        items.forEach(item => {
            const json = JSON.stringify(item.content, null, 4);
            const blob = new Blob([json], { type: "application/json" });
            zip.file(`${item.name}.json`, blob);
        });

        const blob = await zip.generateAsync({ type: "blob" });
        FileSaver.saveAs(blob, name);
    }
}
