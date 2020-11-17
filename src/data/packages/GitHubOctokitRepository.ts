import { Octokit } from "@octokit/rest";
import _ from "lodash";
import { Either } from "../../domain/common/entities/Either";
import { GitHubError, GitHubListError } from "../../domain/packages/entities/Errors";
import { GithubBranch } from "../../domain/packages/entities/GithubBranch";
import { GithubFile } from "../../domain/packages/entities/GithubFile";
import { Store } from "../../domain/packages/entities/Store";
import { StorePermissions } from "../../domain/packages/entities/StorePermissions";
import { GitHubRepository } from "../../domain/packages/repositories/GitHubRepository";
import { cache } from "../../utils/cache";

export class GitHubOctokitRepository implements GitHubRepository {
    @cache()
    public async request<T>(store: Store, url: string): Promise<T> {
        const octokit = await this.getOctoKit(store.token);
        const result = await octokit.request(`GET ${url}`);
        return result.data as T;
    }

    public async listFiles(
        store: Store,
        branch: string
    ): Promise<Either<GitHubListError, GithubFile[]>> {
        try {
            const { token, account, repository } = store;
            const octokit = await this.getOctoKit(token);

            const { data } = await octokit.git.getTree({
                owner: account,
                repo: repository,
                tree_sha: branch,
                recursive: "true",
            });

            if (data.truncated) return Either.error("LIST_TRUNCATED");

            const items: GithubFile[] = data.tree.map(({ path, type, sha, url }) => ({
                path,
                type: type as "blob" | "tree",
                sha,
                url,
            }));

            return Either.success(items);
        } catch (error) {
            return Either.error(this.validateError(error));
        }
    }

    public async readFile<T>(
        store: Store,
        branch: string,
        path: string
    ): Promise<Either<GitHubError, T>> {
        try {
            const { encoding, content } = await this.getFile(store, branch, path);
            return this.readFileContents(encoding, content);
        } catch (error) {
            return Either.error(this.validateError(error));
        }
    }

    public readFileContents<T>(encoding: string, content: string): Either<GitHubError, T> {
        try {
            if (encoding !== "base64") throw new Error("File encoding not supported");
            const result = Buffer.from(content, "base64").toString("utf8");

            return Either.success(this.parseFileContents(result) as T);
        } catch (error) {
            return Either.error(this.validateError(error));
        }
    }

    public async writeFile(
        store: Store,
        branch: string,
        path: string,
        content: string
    ): Promise<Either<GitHubError, void>> {
        try {
            const { token, account, repository } = store;
            const octokit = await this.getOctoKit(token);

            await octokit.repos.createOrUpdateFileContents({
                owner: account,
                repo: repository,
                branch,
                path,
                message: `Updating file ${path}`,
                content: Buffer.from(content).toString("base64"),
                sha: await this.getFileSha(store, branch, path),
                author: {
                    name: "Test",
                    email: "test@eyeseetea.com",
                },
                commiter: {
                    name: "Test",
                    email: "test@eyeseetea.com",
                },
            });

            return Either.success(undefined);
        } catch (error) {
            switch (error.message) {
                // GitHub API returns 404 if user does not have write permissions
                case "Not Found":
                    return Either.error("WRITE_PERMISSIONS");
                default:
                    return Either.error(this.validateError(error));
            }
        }
    }

    public async deleteFile(
        store: Store,
        branch: string,
        path: string
    ): Promise<Either<GitHubError, void>> {
        try {
            const { token, account, repository } = store;
            const octokit = await this.getOctoKit(token);
            const sha = await this.getFileSha(store, branch, path);
            if (!sha) return Either.error("NOT_FOUND");

            await octokit.repos.deleteFile({
                owner: account,
                repo: repository,
                branch,
                path,
                message: `Delete file ${path}`,
                sha,
                author: {
                    name: "Test",
                    email: "test@eyeseetea.com",
                },
                commiter: {
                    name: "Test",
                    email: "test@eyeseetea.com",
                },
            });

            return Either.success(undefined);
        } catch (error) {
            return Either.error(this.validateError(error));
        }
    }

    public async listBranches(store: Store): Promise<Either<GitHubError, GithubBranch[]>> {
        try {
            const { token, account, repository } = store;
            const octokit = await this.getOctoKit(token);

            const { data } = await octokit.repos.listBranches({
                owner: account,
                repo: repository,
            });

            const items: GithubBranch[] = data.map(branch =>
                _.pick(branch, ["name", "commit", "protected"])
            );

            return Either.success(items);
        } catch (error) {
            return Either.error(this.validateError(error));
        }
    }

    public async createBranch(store: Store, branch: string): Promise<Either<GitHubError, void>> {
        try {
            const { token, account, repository } = store;
            if (!token?.trim()) return Either.error("NO_TOKEN");
            const octokit = await this.getOctoKit(token);

            const { default_branch } = await this.getRepoInfo(store);
            const branches = await this.listBranches(store);
            const baseBranch = branches.value.data?.find(({ name }) => name === default_branch);
            if (!baseBranch) return Either.error("BRANCH_NOT_FOUND");

            await octokit.git.createRef({
                owner: account,
                repo: repository,
                ref: `refs/heads/${branch}`,
                sha: baseBranch.commit.sha,
            });

            return Either.success(undefined);
        } catch (error) {
            return Either.error(this.validateError(error));
        }
    }

    public async validateStore(store: Store): Promise<Either<GitHubError, StorePermissions>> {
        try {
            const { token, account, repository } = store;
            if (!token?.trim()) return Either.error("NO_TOKEN");
            if (!account?.trim()) return Either.error("NO_ACCOUNT");
            if (!repository?.trim()) return Either.error("NO_REPOSITORY");

            const octokit = await this.getOctoKit(token);
            const { login: username } = await this.getCurrentUser(store);

            const {
                data: { permission },
            } = await octokit.repos.getCollaboratorPermissionLevel({
                owner: account,
                repo: repository,
                username,
            });

            return Either.success({
                read: permission !== "none",
                write: permission === "admin" || permission === "write",
            });
        } catch (error) {
            return Either.error(this.validateError(error));
        }
    }

    private async getRepoInfo({ token, account, repository }: Store) {
        const octokit = await this.getOctoKit(token);
        const { data } = await octokit.repos.get({
            owner: account,
            repo: repository,
        });
        return data;
    }

    @cache()
    private async getCurrentUser({ token }: Store) {
        const octokit = await this.getOctoKit(token);
        const { data } = await octokit.users.getAuthenticated();
        return data;
    }

    @cache()
    private async getOctoKit(token: string): Promise<Octokit> {
        return new Octokit({ auth: token });
    }

    private validateComplexErrors(error: Error): GitHubError | undefined {
        if (/Branch.*not found/.test(error.message)) {
            return "BRANCH_NOT_FOUND";
        }
    }

    private validateError(error: Error): GitHubError {
        const complexError = this.validateComplexErrors(error);
        if (complexError) return complexError;

        switch (error.message) {
            case "Not Found":
                return "NOT_FOUND";
            case "Bad credentials":
                return "BAD_CREDENTIALS";
            default:
                console.error("Unknown error", error);
                return "UNKNOWN";
        }
    }

    private async getFileSha(
        store: Store,
        branch: string,
        path: string
    ): Promise<string | undefined> {
        try {
            const { sha } = await this.getFile(store, branch, path);
            return sha;
        } catch (error) {
            return undefined;
        }
    }

    private async getFile(
        store: Store,
        branch: string,
        path: string
    ): Promise<{ encoding: string; content: string; sha: string }> {
        const { token, account, repository } = store;
        const octokit = await this.getOctoKit(token);

        try {
            const { data } = await octokit.repos.getContent({
                owner: account,
                repo: repository,
                ref: branch,
                path,
            });

            return data;
        } catch (error) {
            if (!error.errors?.find((error: { code?: string }) => error.code === "too_large")) {
                throw error;
            }

            const files = await this.listFiles(store, branch);
            const file = files.value.data?.find(file => file.path === path);
            if (!file) throw new Error("Not Found");

            const { data } = await octokit.git.getBlob({
                owner: account,
                repo: repository,
                file_sha: file.sha,
            });

            return data;
        }
    }

    private parseFileContents(contents: string): unknown {
        try {
            return JSON.parse(contents);
        } catch (error) {
            return contents;
        }
    }
}
