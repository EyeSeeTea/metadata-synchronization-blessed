import { Either } from "../../common/entities/Either";
import { GitHubError, GitHubListError } from "../entities/Errors";
import { GithubBranch } from "../entities/GithubBranch";
import { GithubFile } from "../entities/GithubFile";
import { Store } from "../../stores/entities/Store";
import { StorePermissions } from "../../stores/entities/StorePermissions";

export interface GitHubRepositoryConstructor {
    new (): GitHubRepository;
}

export const moduleFile = ".module.json";

export interface GitHubRepository {
    request<T>(store: Store, url: string): Promise<T>;
    listFiles(store: Store, branch: string): Promise<Either<GitHubListError, GithubFile[]>>;
    readFile<T>(store: Store, branch: string, path: string): Promise<Either<GitHubError, T>>;
    readFileContents<T>(encoding: string, content: string): Either<GitHubError, T>;
    writeFile(store: Store, branch: string, path: string, content: string): Promise<Either<GitHubError, void>>;
    deleteFile(store: Store, branch: string, path: string): Promise<Either<GitHubError, void>>;
    listBranches(store: Store): Promise<Either<GitHubError, GithubBranch[]>>;
    createBranch(store: Store, branch: string): Promise<Either<GitHubError, void>>;
    validateStore(store: Store): Promise<Either<GitHubError, StorePermissions>>;
}
