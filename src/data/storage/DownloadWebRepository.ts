import FileSaver from "file-saver";
import JSZip from "jszip";
import _ from "lodash";
import {
    DownloadItem,
    DownloadRepository,
} from "../../domain/storage/repositories/DownloadRepository";
import { TransformationRepository } from "../../domain/transformations/repositories/TransformationRepository";
import { metadataTransformations } from "../transformations/PackageTransformations";

export class DownloadWebRepository implements DownloadRepository {
    constructor(private transformationRepository: TransformationRepository) {}

    public downloadFile(name: string, payload: unknown, apiVersion?: number): void {
        const versionedPayloadPackage = apiVersion
            ? this.transformationRepository.mapPackageTo(
                  apiVersion,
                  payload,
                  metadataTransformations
              )
            : payload;

        const json = JSON.stringify(versionedPayloadPackage, null, 4);
        const blob = new Blob([json], { type: "application/json" });
        FileSaver.saveAs(blob, name);
    }

    public async downloadZippedFiles(name: string, items: DownloadItem[]): Promise<void> {
        const zip = new JSZip();

        _(items)
            .groupBy(item => item.name)
            .mapValues(items =>
                items.length > 1
                    ? items.map((item, i) => ({ ...item, name: `${item.name}-${i + 1}` }))
                    : items
            )
            .values()
            .flatten()
            .forEach(item => {
                const versionedPayloadPackage = item.apiVersion
                    ? this.transformationRepository.mapPackageTo(
                          item.apiVersion,
                          item.content,
                          metadataTransformations
                      )
                    : item.content;

                const json = JSON.stringify(versionedPayloadPackage, null, 4);
                const blob = new Blob([json], { type: "application/json" });
                zip.file(`${item.name}.json`, blob);
            });

        const blob = await zip.generateAsync({ type: "blob" });
        FileSaver.saveAs(blob, name);
    }
}
