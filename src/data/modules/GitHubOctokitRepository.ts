import { Octokit } from "@octokit/rest";
import _ from "lodash";
import { Either } from "../../domain/common/entities/Either";
import { GitHubError } from "../../domain/modules/entities/Errors";
import { Store } from "../../domain/modules/entities/Store";
import { StorePermissions } from "../../domain/modules/entities/StorePermissions";
import { GitHubRepository } from "../../domain/modules/repositories/GitHubRepository";
import { StorageRepository } from "../../domain/storage/repositories/StorageRepository";
import { cache, clear } from "../../utils/cache";

export class GitHubOctokitRepository implements GitHubRepository {
    constructor(private storageRepository: StorageRepository) {}

    public async validateStore({
        token,
        account,
        repository,
    }: Store): Promise<Either<GitHubError, StorePermissions>> {
        try {
            const octokit = await this.getOctoKit(token);

            const { data: branches } = await octokit.repos.listBranches({
                owner: account,
                repo: repository,
            });

            const { data: repos } = await octokit.repos.listForAuthenticatedUser();
            const { permissions } = _.find(repos, { full_name: `${account}/${repository}` }) ?? {};

            return Either.success({ read: branches.length > 0, write: !!permissions?.push });
        } catch (error) {
            switch (error.message) {
                case "Not Found":
                    return Either.error("NOT_FOUND");
                case "Bad credentials":
                    return Either.error("BAD_CREDENTIALS");
                default:
                    throw error;
            }
        }
    }

    public resetCredentials(): void {
        clear(this.getOctoKit);
        clear(this.getCurrentUser);
    }

    @cache()
    public async getCurrentUser() {
        const octokit = await this.getOctoKit();
        const { data } = await octokit.users.getAuthenticated();
        return data;
    }

    @cache()
    private async getOctoKit(testToken?: string): Promise<Octokit> {
        if (testToken) return new Octokit({ auth: testToken });

        const { token } = await this.storageRepository.getObject<{ token?: string }>(
            "GITHUB_SETTINGS",
            {}
        );

        if (!token) throw new Error("GitHub connection not initialized");
        return new Octokit({ auth: token });
    }
}
