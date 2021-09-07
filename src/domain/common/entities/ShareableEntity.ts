import _ from "lodash";
import { SharedRef } from "./Ref";
import { User } from "../../user/entities/User";

export class ShareableEntity<T extends SharedRef> {
    constructor(protected data: T) {}

    public hasPermissions(permission: "read" | "write", currentUser: User) {
        if (currentUser.isGlobalAdmin) return true;

        const { publicAccess = "--------", userAccesses = [], userGroupAccesses = [], user } = this.data;
        const token = permission === "read" ? "r" : "w";

        const isUserOwner = user?.id === currentUser.id;
        const isPublic = publicAccess.substring(0, 2).includes(token);

        const hasUserAccess = !!_(userAccesses)
            .filter(({ access }) => access.substring(0, 2).includes(token))
            .find(({ id }) => id === currentUser.id);

        const hasGroupAccess =
            _(userGroupAccesses)
                .filter(({ access }) => access.substring(0, 2).includes(token))
                .intersectionBy(currentUser.userGroups, "id")
                .value().length > 0;

        return currentUser.isAppConfigurator && (isUserOwner || isPublic || hasUserAccess || hasGroupAccess);
    }
}
