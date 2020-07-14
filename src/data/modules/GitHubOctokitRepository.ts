import { Octokit } from "@octokit/rest";
import { Either } from "../../domain/common/entities/Either";
import { GitHubError } from "../../domain/modules/entities/Errors";
import { Store } from "../../domain/modules/entities/Store";
import { StorePermissions } from "../../domain/modules/entities/StorePermissions";
import { GitHubRepository } from "../../domain/modules/repositories/GitHubRepository";
import { cache } from "../../utils/cache";

export class GitHubOctokitRepository implements GitHubRepository {
    public async readFile<T>(store: Store, path: string): Promise<Either<GitHubError, T>> {
        try {
            const { encoding, content } = await this.getFile(store, path);
            if (encoding !== "base64") throw new Error("File encoding not supported");
            const result = Buffer.from(content, "base64").toString("utf8");

            return Either.success(this.parseFileContents(result) as T);
        } catch (error) {
            return Either.error(this.validateError(error));
        }
    }

    public async writeFile(
        store: Store,
        path: string,
        content: unknown
    ): Promise<Either<GitHubError, void>> {
        try {
            const { token, account, repository } = store;
            const octokit = await this.getOctoKit(token);

            await octokit.repos.createOrUpdateFileContents({
                owner: account,
                repo: repository,
                path,
                message: `Updating file ${path}`,
                content: Buffer.from(JSON.stringify(content)).toString("base64"),
                sha: await this.getFileSha(store, path),
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

    public async deleteFile(store: Store, path: string): Promise<Either<GitHubError, void>> {
        try {
            const { token, account, repository } = store;
            const octokit = await this.getOctoKit(token);
            const sha = await this.getFileSha(store, path);
            if (!sha) return Either.error("NOT_FOUND");

            await octokit.repos.deleteFile({
                owner: account,
                repo: repository,
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

    public async validateStore(store: Store): Promise<Either<GitHubError, StorePermissions>> {
        try {
            const { token, account, repository } = store;
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

    @cache()
    public async getCurrentUser({ token }: Store) {
        const octokit = await this.getOctoKit(token);
        const { data } = await octokit.users.getAuthenticated();
        return data;
    }

    @cache()
    private async getOctoKit(token: string): Promise<Octokit> {
        return new Octokit({ auth: token });
    }

    private validateError(error: Error): GitHubError {
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

    private async getFileSha(store: Store, path: string): Promise<string | undefined> {
        try {
            const { sha } = await this.getFile(store, path);
            return sha;
        } catch (error) {
            return undefined;
        }
    }

    private async getFile({ token, account, repository }: Store, path: string) {
        const octokit = await this.getOctoKit(token);

        const { data } = await octokit.repos.getContent({
            owner: account,
            repo: repository,
            path,
        });

        return data;
    }

    private parseFileContents(contents: string): unknown {
        try {
            return JSON.parse(contents);
        } catch (error) {
            return contents;
        }
    }
}
