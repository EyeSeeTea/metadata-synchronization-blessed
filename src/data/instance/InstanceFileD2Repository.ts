import {
    FileId,
    InstanceFileRepository,
} from "../../domain/instance/repositories/InstanceFileRepository";
import { Instance } from "../../domain/instance/entities/Instance";
import mime from "mime-types";
import { D2Api } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-utils";
import { debug } from "../../utils/debug";

export class InstanceFileD2Repository implements InstanceFileRepository {
    private api: D2Api;

    constructor(private instance: Instance) {
        this.api = getD2APiFromInstance(this.instance);
    }

    public async getById(fileId: FileId): Promise<File> {
        debug("fileId: ", fileId);
        const response = await this.api.files.get(fileId).getData();
        debug("Response: ", response);

        if (!response) {
            throw Error("An error has ocurred retrieving the file resource of document");
        } else {
            const documentName = await this.api.models.documents
                .get({ filter: { id: { eq: fileId } }, fields: { name: true } })
                .getData();
            debug("documentName: ", documentName);
            return this.blobToFile(
                response,
                `${documentName.objects[0].name}.${mime.extension(response.type)}`
            );
        }
    }

    public async save(documentId: string, file: File): Promise<FileId> {
        const { fileResourceId } = await this.api.files
            .upload({
                id: documentId,
                name: file.name,
                data: file,
            })
            .getData();
        debug("File ID", fileResourceId);
        return fileResourceId;
    }

    private blobToFile = (blob: Blob, fileName: string): File => {
        return new File([blob], fileName, { type: blob.type });
    };
}
