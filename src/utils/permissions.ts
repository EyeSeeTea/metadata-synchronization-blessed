import axios from "axios";

import { D2 } from "../types/d2";

export enum AppRoles {
    METADATA_SYNC_ADMINISTRATOR,
}

export const hasUserRole = async (d2: D2, userRole: AppRoles) => {
    const userRoles = await d2.currentUser.getUserRoles();
    return userRoles.toArray().find((role: any) => role.name === AppRoles[userRole]);
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
