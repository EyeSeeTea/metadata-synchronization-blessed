import mime from "mime-types";
import { Instance } from "../../domain/instance/entities/Instance";
import {
    FileId,
    FileResourceDomain,
    InstanceFileRepository,
} from "../../domain/instance/repositories/InstanceFileRepository";
import { D2Api, D2ApiResponse } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-utils";

export class InstanceFileD2Repository implements InstanceFileRepository {
    private api: D2Api;

    constructor(private instance: Instance) {
        this.api = getD2APiFromInstance(this.instance);
    }

    public async getById(fileId: FileId): Promise<File> {
        const response = await this.api.files.get(fileId).getData();
        if (!response) throw Error("An error has ocurred retrieving the file resource of document");

        const { objects } = await this.api.models.documents
            .get({ filter: { id: { eq: fileId } }, fields: { name: true } })
            .getData();

        const documentName = objects[0]?.name ?? "File";
        return this.blobToFile(response, `${documentName}.${mime.extension(response.type)}`);
    }

    public async save(file: File, domain: FileResourceDomain = "DOCUMENT"): Promise<FileId> {
        if (domain === "DOCUMENT") {
            const fileResourceId = await this.api.files
                .saveFileResource({
                    name: file.name,
                    data: file,
                })
                .getData();

            return fileResourceId;
        } else {
            const fileResourceId = await this.saveFileResource(
                {
                    name: file.name,
                    data: file,
                },
                domain
            ).getData();

            return fileResourceId;
        }
    }

    saveFileResource(params: { name: string; data: Blob }, domain: FileResourceDomain): D2ApiResponse<string> {
        const { name, data } = params;

        const formData = new FormData();
        formData.append("file", data, name);
        formData.append("contentType", data.type);
        formData.append("domain", domain);

        return this.api.apiConnection
            .request<PartialSaveResponse>({
                method: "post",
                url: "/fileResources",
                data: formData,
                requestBodyType: "raw",
            })
            .map(({ data }) => {
                if (!data.response || !data.response.fileResource || !data.response.fileResource.id) {
                    throw new Error("Unable to store file, couldn't find resource");
                }

                return data.response.fileResource.id;
            });
    }

    private blobToFile = (blob: Blob, fileName: string): File => {
        return new File([blob], fileName, { type: blob.type });
    };
}

interface PartialSaveResponse {
    response?: {
        fileResource?: {
            id?: string;
        };
    };
}
