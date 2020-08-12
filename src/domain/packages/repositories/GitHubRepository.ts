import { Either } from "../../common/entities/Either";
import { GitHubError } from "../entities/Errors";
import { Store } from "../entities/Store";
import { StorePermissions } from "../entities/StorePermissions";

export interface GitHubRepositoryConstructor {
    new (): GitHubRepository;
}

export interface GitHubRepository {
    readFile<T>(store: Store, path: string): Promise<Either<GitHubError, T>>;
    writeFile(
        store: Store,
        branch: string,
        path: string,
        content: string
    ): Promise<Either<GitHubError, void>>;
    deleteFile(store: Store, path: string): Promise<Either<GitHubError, void>>;
    validateStore(store: Store): Promise<Either<GitHubError, StorePermissions>>;
}
