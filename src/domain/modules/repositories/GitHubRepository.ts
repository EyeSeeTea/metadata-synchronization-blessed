import { Either } from "../../common/entities/Either";
import { GitHubError } from "../entities/Errors";
import { Store } from "../entities/Store";
import { StorePermissions } from "../entities/StorePermissions";

export interface GitHubRepository {
    validateStore(store: Store): Promise<Either<GitHubError, StorePermissions>>;
    resetCredentials(): void;
}
