export interface FileRepositoryConstructor {
    new (): FileRepository;
}

export interface FileRepository {
    readObjectsInFile<ReturnType>(file: Blob): Promise<ReturnType[]>;
    readJSONFile<ReturnType>(file: Blob): Promise<ReturnType | undefined>;
}
