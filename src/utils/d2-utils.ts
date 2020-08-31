import _ from "lodash";

export function getMajorVersion(version: string): number {
    const apiVersion = _.get(version.split("."), 1);
    if (!apiVersion) throw new Error(`Invalid version: ${version}`);
    return Number(apiVersion);
}
