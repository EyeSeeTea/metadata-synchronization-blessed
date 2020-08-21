export interface GithubBranch {
    name: string;
    commit: {
        sha: string;
        url: string;
    };
    protected: boolean;
}
