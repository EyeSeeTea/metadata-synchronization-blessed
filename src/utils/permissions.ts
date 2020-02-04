import axios from "axios";
import memoize from "nano-memoize";

import { D2 } from "../types/d2";
import SyncRule from "../models/syncRule";

const AppRoles: {
    [key: string]: {
        name: string;
        description: string;
        initialize: boolean;
    };
} = {
    CONFIGURATION_ACCESS: {
        name: "METADATA_SYNC_CONFIGURATOR",
        description:
            "APP - This role allows to create new instances and synchronization rules in the Metadata Sync app",
        initialize: true,
    },
    SYNC_RULE_EXECUTION_ACCESS: {
        name: "METADATA_SYNC_EXECUTOR",
        description:
            "APP - This role allows to execute synchronization rules in the Metadata Sync app",
        initialize: true,
    },
    SHOW_DELETED_OBJECTS: {
        name: "METADATA_SYNC_SHOW_DELETED_OBJECTS",
        description: "APP - This role allows the user to synchronize deleted objects",
        initialize: false,
    },
};

export interface UserInfo {
    userGroups: any[];
    id: string;
    name: string;
    username: string;
}

const getUserRoles = memoize(async (d2: D2) => {
    const baseUrl = d2.Api.getApi().baseUrl;
    const { userCredentials } = (
        await axios.get(baseUrl + "/me", {
            withCredentials: true,
            params: {
                fields: "userCredentials[userRoles[:all]]",
            },
        })
    ).data;
    return userCredentials.userRoles;
});

export const shouldShowDeletedObjects = async (d2: D2) => {
    const userRoles = await getUserRoles(d2);
    const { name } = AppRoles.SHOW_DELETED_OBJECTS;

    return !!userRoles.find((role: any) => role.name === name);
};

export const isGlobalAdmin = async (d2: D2) => {
    const userRoles = await getUserRoles(d2);
    return !!userRoles.find((role: any) =>
        role.authorities.find((authority: string) => authority === "ALL")
    );
};

export const isAppConfigurator = async (d2: D2) => {
    const userRoles = await getUserRoles(d2);
    const globalAdmin = await isGlobalAdmin(d2);
    const { name } = AppRoles.CONFIGURATION_ACCESS;

    return globalAdmin || !!userRoles.find((role: any) => role.name === name);
};

export const isAppExecutor = async (d2: D2) => {
    const userRoles = await getUserRoles(d2);
    const globalAdmin = await isGlobalAdmin(d2);
    const { name } = AppRoles.SYNC_RULE_EXECUTION_ACCESS;

    return globalAdmin || !!userRoles.find((role: any) => role.name === name);
};

export const verifyUserHasAccessToSyncRule = async (d2: D2, syncRuleUId: string) => {
    const globalAdmin = await isGlobalAdmin(d2);
    if (globalAdmin) return true;

    const appConfigurator = await isAppConfigurator(d2);
    const userInfo = await getUserInfo(d2);

    const syncRule = await SyncRule.get(d2, syncRuleUId);

    const syncRuleVisibleToUser = syncRuleUId ? syncRule.isVisibleToUser(userInfo, "WRITE") : true;

    return appConfigurator && syncRuleVisibleToUser;
};

export const getUserInfo = memoize(
    async (d2: D2): Promise<UserInfo> => {
        const userGroups = await d2.currentUser.getUserGroups();

        return {
            userGroups: userGroups.toArray(),
            id: d2.currentUser.id,
            name: d2.currentUser.name,
            username: d2.currentUser.username,
        };
    }
);

export const initializeAppRoles = async (baseUrl: string) => {
    for (const role in AppRoles) {
        const { name, description, initialize } = AppRoles[role];
        if (initialize) {
            const { userRoles } = (
                await axios.get(baseUrl + "/metadata", {
                    withCredentials: true,
                    params: {
                        userRoles: true,
                        filter: `name:eq:${name}`,
                        fields: "id",
                    },
                })
            ).data as { userRoles?: { id: string }[] };

            if (!userRoles || userRoles.length === 0) {
                await axios.post(
                    baseUrl + "/metadata.json",
                    {
                        userRoles: [
                            {
                                name,
                                description,
                                publicAccess: "--------",
                            },
                        ],
                    },
                    {
                        withCredentials: true,
                    }
                );
            }
        }
    }
};
