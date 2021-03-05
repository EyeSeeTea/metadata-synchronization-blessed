import _ from "lodash";
import { SharedRef } from "./Ref";
import { UserInfo } from "./UserInfo";

export class ShareableEntity<T extends SharedRef> {
    constructor(protected data: T) {}

    public hasPermissions(permission: "read" | "write", userInfo: UserInfo) {
        if (userInfo.isGlobalAdmin) return true;

        const {
            publicAccess = "--------",
            userAccesses = [],
            userGroupAccesses = [],
            user,
        } = this.data;
        const token = permission === "read" ? "r" : "w";

        const isUserOwner = user.id === userInfo.id;
        const isPublic = publicAccess.substring(0, 2).includes(token);

        const hasUserAccess = !!_(userAccesses)
            .filter(({ access }) => access.substring(0, 2).includes(token))
            .find(({ id }) => id === userInfo.id);

        const hasGroupAccess =
            _(userGroupAccesses)
                .filter(({ access }) => access.substring(0, 2).includes(token))
                .intersectionBy(userInfo.userGroups, "id")
                .value().length > 0;

        return (
            userInfo.isAppConfigurator &&
            (isUserOwner || isPublic || hasUserAccess || hasGroupAccess)
        );
    }
}
