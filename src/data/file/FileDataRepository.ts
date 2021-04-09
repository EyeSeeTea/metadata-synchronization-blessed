import JSZip from "jszip";
import _ from "lodash";
import { FileRepository } from "../../domain/file/repositories/FileRepository";
import { promiseMap } from "../../utils/common";

export class FileDataRepository implements FileRepository {
    // Accepts either a zip file that contains a collection of JSONs or a JSON itself
    public async readObjectsInFile<ReturnType>(file: Blob): Promise<ReturnType[]> {
        if (mimeTypes.JSON.includes(file.type)) {
            const object = await this.readJSONFile<ReturnType>(file);
            return _.compact([object]);
        }

        if (mimeTypes.ZIP.includes(file.type)) {
            const zip = new JSZip();
            const contents = await zip.loadAsync(file);
            const modulePaths = getModulePaths(contents);

            const objects = await promiseMap(modulePaths, async path => {
                const obj = zip.file(path);
                if (!obj) return [];

                const blob = await obj.async("blob");
                return this.readObjectsInFile<ReturnType>(blob);
            });

            return _.flatten(objects);
        }

        return [];
    }

    public async readJSONFile<ReturnType>(file: Blob): Promise<ReturnType | undefined> {
        try {
            const text = await file.text();
            return JSON.parse(text) as ReturnType;
        } catch (error) {
            console.error(error);
            return undefined;
        }
    }
}

const mimeTypes = {
    JSON: ["application/json"],
    ZIP: ["application/zip", "application/zip-compressed", "application/x-zip-compressed"],
};

function getModulePaths(contents: JSZip) {
    return _(contents.files).keys().compact().value();
}
