export type GitHubError =
    | "NOT_FOUND"
    | "NO_TOKEN"
    | "BAD_CREDENTIALS"
    | "WRITE_PERMISSIONS"
    | "BRANCH_NOT_FOUND"
    | "UNKNOWN";

export type GitHubListError = GitHubError | "LIST_TRUNCATED";
