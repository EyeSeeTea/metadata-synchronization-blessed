export interface FileRepositoryConstructor {
    new (): FileRepository;
}

export interface FileRepository {
    readObjectsInFile<ReturnType>(file: Blob, fileName?: string): Promise<{ name: string; value: ReturnType }[]>;
    readJSONFile<ReturnType>(file: Blob): Promise<ReturnType | undefined>;
}
