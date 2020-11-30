import { Instance } from "../instance/entities/Instance";

export interface FileRepositoryConstructor {
    new (instance: Instance): FileRepository;
}

export type FileId = string;

export interface FileRepository {
    getById(fileId: FileId): Promise<File>;
    save(file: File): Promise<FileId>;
}
