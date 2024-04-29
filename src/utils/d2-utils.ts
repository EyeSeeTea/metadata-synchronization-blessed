import _ from "lodash";
import { D2Api } from "../types/d2-api";
import { Instance } from "../domain/instance/entities/Instance";

export function getMajorVersion(version: string): number {
    const apiVersion = _.get(version.split("."), 1);
    if (!apiVersion) throw new Error(`Invalid version: ${version}`);
    return Number(apiVersion);
}

export function getD2APiFromInstance(instance: Instance) {
    /*
    Problem: If we use Axios (XMLHttpRequest.withCredentials option), the session is lost when
    connecting to an instance in the same domain (even with a different path prefix or port).

    Solution: Use fetch API (now supported by d2-api), so it sends credentials=omit when auth is passed.

    Documentation:

    https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
    https://developer.mozilla.org/en-US/docs/Web/API/Request/credentials
    */
    return new D2Api({ baseUrl: instance.url, auth: instance.auth, backend: "fetch" });
}
