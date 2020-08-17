export interface GithubFile {
    path: string;
    sha: string;
    type: "tree" | "blob";
    url: string;
}
