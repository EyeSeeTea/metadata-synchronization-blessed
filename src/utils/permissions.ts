import axios from "axios";

import { D2 } from "../types/d2";

export enum AppRoles {
    METADATA_SYNC_ADMINISTRATOR,
}

export const getUserInfo = async (
    d2: D2
): Promise<{
    userGroups: any[];
    userRoles: any[];
    id: string;
    name: string;
    username: string;
    isAdmin: boolean;
}> => {
    const userGroups = await d2.currentUser.getUserGroups();
    const userRoles = await d2.currentUser.getUserRoles();
    const isAdmin = userRoles
        .toArray()
        .find((role: any) => role.name === AppRoles[AppRoles.METADATA_SYNC_ADMINISTRATOR]);

    return {
        userGroups: userGroups.toArray(),
        userRoles: userRoles.toArray(),
        id: d2.currentUser.id,
        name: d2.currentUser.name,
        username: d2.currentUser.username,
        isAdmin,
    };
};

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
