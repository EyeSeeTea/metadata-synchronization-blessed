import axios from "axios";
import memoize from "nano-memoize";

import { D2 } from "../types/d2";

export enum AppRoles {
    METADATA_SYNC_ADMINISTRATOR = "METADATA_SYNC_ADMINISTRATOR",
    METADATA_SYNC_EXECUTOR = "METADATA_SYNC_EXECUTOR",
}

export interface UserInfo {
    userGroups: any[];
    id: string;
    name: string;
    username: string;
}

const getUserRoles = memoize(async (d2: D2) => {
    const baseUrl = d2.Api.getApi().baseUrl;
    const { userCredentials } = (await axios.get(baseUrl + "/me", {
        withCredentials: true,
        params: {
            fields: "userCredentials[userRoles[:all]]",
        },
    })).data;
    return userCredentials.userRoles;
});

export const isGlobalAdmin = async (d2: D2) => {
    const userRoles = await getUserRoles(d2);
    return !!userRoles
        .find((role: any) => role.authorities.find((authority: string) => authority === "ALL"));
};

export const isAppAdmin = async (d2: D2) => {
    const userRoles = await getUserRoles(d2);
    const globalAdmin = await isGlobalAdmin(d2);
    return (
        globalAdmin ||
        !!userRoles
            .find((role: any) => role.name === AppRoles.METADATA_SYNC_ADMINISTRATOR)
    );
};

export const isAppExecutor = async (d2: D2) => {
    const userRoles = await getUserRoles(d2);
    const appAdmin = await isAppAdmin(d2);
    return (
        appAdmin ||
        !!userRoles.find((role: any) => role.name === AppRoles.METADATA_SYNC_EXECUTOR)
    );
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
        const { userRoles } = (await axios.get(baseUrl + "/metadata", {
            withCredentials: true,
            params: {
                userRoles: true,
                filter: `name:eq:${role}`,
                fields: "id",
            },
        })).data as { userRoles?: { id: string }[] };

        if (!userRoles || userRoles.length === 0) {
            await axios.post(
                baseUrl + "/metadata.json",
                {
                    userRoles: [
                        {
                            name: role,
                            description:
                                "APP - This role gives administrative access to the Metadata Sync app",
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
};
