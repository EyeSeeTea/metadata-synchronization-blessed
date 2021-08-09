import mime from "mime-types";
import { Instance } from "../../domain/instance/entities/Instance";
import { FileId, InstanceFileRepository } from "../../domain/instance/repositories/InstanceFileRepository";
import { D2Api } from "../../types/d2-api";
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

    public async save(file: File): Promise<FileId> {
        const fileResourceId = await this.api.files
            .saveFileResource({
                name: file.name,
                data: file,
            })
            .getData();

        return fileResourceId;
    }

    private blobToFile = (blob: Blob, fileName: string): File => {
        return new File([blob], fileName, { type: blob.type });
    };
}
