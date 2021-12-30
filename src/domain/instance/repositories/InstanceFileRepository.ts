import { Instance } from "../entities/Instance";

export interface InstanceFileRepositoryConstructor {
    new (instance: Instance): InstanceFileRepository;
}

export type FileId = string;

export type FileResourceDomain = "DOCUMENT" | "DATA_VALUE";

export interface InstanceFileRepository {
    getById(fileId: FileId): Promise<File>;
    save(file: File, domain?: FileResourceDomain): Promise<FileId>;
}
