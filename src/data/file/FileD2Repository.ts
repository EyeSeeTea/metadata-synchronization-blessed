import { D2Document } from "d2-api/2.30";
import { FileId, FileRepository } from "../../domain/file/FileRepository";
import { Instance } from "../../domain/instance/entities/Instance";
import mime from "mime-types";

interface SaveApiResponse {
    response: {
        fileResource: {
            id: string;
        };
    };
}

export class FileD2Repository implements FileRepository {
    constructor(private instance: Instance) {}

    public async getById(fileId: FileId): Promise<File> {
        const auth = this.instance.auth;

        const authHeaders: Record<string, string> = this.getAuthHeaders(auth);

        const fetchOptions: RequestInit = {
            method: "GET",
            headers: { ...authHeaders },
            credentials: auth ? "omit" : ("include" as const),
        };

        const documentResponse = await fetch(
            new URL(`/api/documents/${fileId}`, this.instance.url).href,
            fetchOptions
        );

        const document: D2Document = JSON.parse(await documentResponse.text());

        const response = await fetch(
            new URL(`/api/documents/${fileId}/data`, this.instance.url).href,
            fetchOptions
        );

        if (!response.ok) {
            throw Error(
                `An error has ocurred retrieving the file resource of document '${document.name}' from ${this.instance.name}`
            );
        } else {
            const blob = await response.blob();

            return this.blobToFile(blob, `${document.name}.${mime.extension(blob.type)}`);
        }
    }

    public async save(file: File): Promise<FileId> {
        const auth = this.instance.auth;

        const authHeaders: Record<string, string> = this.getAuthHeaders(auth);

        const formdata = new FormData();
        formdata.append("file", file);
        formdata.append("filename", file.name);

        const fetchOptions: RequestInit = {
            method: "POST",
            headers: { ...authHeaders },
            body: formdata,
            credentials: auth ? "omit" : ("include" as const),
        };

        const response = await fetch(
            new URL(`/api/fileResources`, this.instance.url).href,
            fetchOptions
        );
        if (!response.ok) {
            const responseBody = JSON.parse(await response.text());

            const bodyError = responseBody.message ? `: ${responseBody.message}` : "";

            throw Error(
                `An error has ocurred saving the resource file of the document '${file.name}' in ${this.instance.name}${bodyError}`
            );
        } else {
            const apiResponse: SaveApiResponse = JSON.parse(await response.text());

            return apiResponse.response.fileResource.id;
        }
    }

    private getAuthHeaders(
        auth: { username: string; password: string } | undefined
    ): Record<string, string> {
        return auth ? { Authorization: "Basic " + btoa(auth.username + ":" + auth.password) } : {};
    }

    private blobToFile = (blob: Blob, fileName: string): File => {
        return new File([blob], fileName, { type: blob.type });
    };
}
