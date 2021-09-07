import FileSaver from "file-saver";
import JSZip from "jszip";
import _ from "lodash";
import { DownloadItem, DownloadRepository } from "../../domain/storage/repositories/DownloadRepository";

export class DownloadWebRepository implements DownloadRepository {
    public downloadFile(name: string, payload: unknown): void {
        const json = JSON.stringify(payload, null, 4);
        const blob = new Blob([json], { type: "application/json" });
        FileSaver.saveAs(blob, `${name}.json`);
    }

    public async downloadZippedFiles(name: string, items: DownloadItem[]): Promise<void> {
        const zip = new JSZip();

        _(items)
            .groupBy(item => item.name)
            .mapValues(items =>
                items.length > 1 ? items.map((item, i) => ({ ...item, name: `${item.name}-${i + 1}` })) : items
            )
            .values()
            .flatten()
            .forEach(item => {
                const json = JSON.stringify(item.content, null, 4);
                const blob = new Blob([json], { type: "application/json" });
                zip.file(`${item.name}.json`, blob);
            });

        const blob = await zip.generateAsync({ type: "blob" });
        FileSaver.saveAs(blob, `${name}.zip`);
    }
}
