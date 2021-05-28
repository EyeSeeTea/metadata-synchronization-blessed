import {
    FileId,
    InstanceFileRepository,
} from "../../domain/instance/repositories/InstanceFileRepository";
import { Instance } from "../../domain/instance/entities/Instance";
import mime from "mime-types";
import { D2Api } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-utils";
import { getUid } from "./uid";

/*interface SaveApiResponse {
    response: {
        fileResource: {
            id: string;
        };
    };
}*/

export class InstanceFileD2Repository implements InstanceFileRepository {
    private api: D2Api;
    public baseUrl: string;

    constructor(private instance: Instance) {
        this.api = getD2APiFromInstance(instance);
        this.baseUrl = this.api.baseUrl;
    }


    public async getById(fileId: FileId): Promise<File> {
        const auth = this.instance.auth;

        const authHeaders: Record<string, string> = auth
            ? { Authorization: "Basic " + btoa(auth.username + ":" + auth.password) }
            : {};

        const fetchOptions: RequestInit = {
            method: "GET",
            headers: authHeaders,
            credentials: auth ? "omit" : "include",
        };

        const response = await fetch(`${this.baseUrl}/api/documents/${fileId}/data`, fetchOptions);

        if (!response.ok) {
            throw Error("An error has ocurred retrieving the file resource of document");
        } else {
            const blob = await response.blob();

            return this.blobToFile(blob, `document1.${mime.extension(blob.type)}`);
        }
    }

    public async save(file: File): Promise<FileId> {
        const fileToBlob = new Blob([new Uint8Array(await file.arrayBuffer())], {type: file.type });

        const ff = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = ev => {
                if (ev.target) {
                    resolve(ev.target.result as string);
                } else {
                    reject(new Error("Could not convert array to string!"));
                }
            };
            reader.readAsText(fileToBlob, "UTF-8");
        });
        const { id } = await this.api.files
            .upload({
                id: getUid(ff),
                name: file.name,
                data: fileToBlob,
            })
            .getData();
        console.log(`here is the ID: ${id}`);

        if (!id) {
            //const responseBody = JSON.parse(await response.text());

            //const bodyError = responseBody.message ? `: ${responseBody.message}` : "";

            throw Error(
                `An error has ocurred saving the resource file of the document '${file.name}' in ${this.instance.name}`
            );
        } else {
            //return `${this.api.apiPath}/documents/${id}/data`;

            //const apiResponse: SaveApiResponse = JSON.parse(await response.text());

            return id;
        }
    }
    
    private blobToFile = (blob: Blob, fileName: string): File => {
        return new File([blob], fileName, { type: blob.type });
    };
}
