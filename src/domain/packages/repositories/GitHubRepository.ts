import { Either } from "../../common/entities/Either";
import { GitHubError } from "../entities/Errors";
import { Store } from "../entities/Store";
import { StorePermissions } from "../entities/StorePermissions";
import { GithubFile } from "../entities/GithubFile";

export interface GitHubRepositoryConstructor {
    new (): GitHubRepository;
}

export interface GitHubRepository {
    listFiles(store: Store, branch: string): Promise<GithubFile[]>;
    readFile<T>(store: Store, branch: string, path: string): Promise<Either<GitHubError, T>>;
    writeFile(
        store: Store,
        branch: string,
        path: string,
        content: string
    ): Promise<Either<GitHubError, void>>;
    deleteFile(store: Store, branch: string, path: string): Promise<Either<GitHubError, void>>;
    validateStore(store: Store): Promise<Either<GitHubError, StorePermissions>>;
}
