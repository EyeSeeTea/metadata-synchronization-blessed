import axios from "axios";
import memoize from "nano-memoize";
import { SynchronizationRule } from "../domain/rules/entities/SynchronizationRule";
import { D2Api } from "../types/d2-api";

// Applying parallel change
// Exists a GetCurrentUseCase that we should use for the new code
//TODO: remove all this code when all code use GetCurrentUseCase because contains all necessary data about permisions
//  | |
//  V V

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
        description: "APP - This role allows to execute synchronization rules in the Metadata Sync app",
        initialize: true,
    },
    SHOW_DELETED_OBJECTS: {
        name: "METADATA_SYNC_SHOW_DELETED_OBJECTS",
        description: "APP - This role allows the user to synchronize deleted objects",
        initialize: false,
    },
};

/**
 * @deprecated The interface should not be used, please use domain user entity
 */
export interface UserInfo {
    userGroups: any[];
    id: string;
    name: string;
    username: string;
}

/**
 * @deprecated The function should not be used, please use getCurrentUserUseCase
 */
export const getUserInfo = memoize(
    async (api: D2Api): Promise<UserInfo> => {
        const currentUser = await api.currentUser
            .get({
                fields: {
                    id: true,
                    name: true,
                    userCredentials: { username: true },
                    userGroups: true,
                },
            })
            .getData();

        return {
            userGroups: currentUser.userGroups,
            id: currentUser.id,
            name: currentUser.name,
            username: currentUser.userCredentials.username,
        };
    },
    { serializer: (api: D2Api) => api.baseUrl }
);

/**
 * @deprecated The function should not be used, please use getCurrentUserUseCase
 */
const getUserRoles = memoize(
    async (api: D2Api) => {
        const currentUser = await api.currentUser
            .get({
                fields: {
                    userCredentials: {
                        userRoles: {
                            $all: true,
                        },
                    },
                },
            })
            .getData();

        return currentUser.userCredentials.userRoles;
    },
    { serializer: (api: D2Api) => api.baseUrl }
);

export const shouldShowDeletedObjects = async (api: D2Api) => {
    const userRoles = await getUserRoles(api);
    const { name } = AppRoles.SHOW_DELETED_OBJECTS;

    return !!userRoles.find((role: any) => role.name === name);
};

/**
 * @deprecated The function should not be used, please use getCurrentUserUseCase
 */
export const isGlobalAdmin = async (api: D2Api) => {
    const userRoles = await getUserRoles(api);
    return !!userRoles.find((role: any) => role.authorities.find((authority: string) => authority === "ALL"));
};

/**
 * @deprecated The function should not be used, please use getCurrentUserUseCase
 */
export const isAppConfigurator = async (api: D2Api) => {
    const userRoles = await getUserRoles(api);
    const globalAdmin = await isGlobalAdmin(api);
    const { name } = AppRoles.CONFIGURATION_ACCESS;

    return globalAdmin || !!userRoles.find((role: any) => role.name === name);
};

/**
 * @deprecated The function should not be used, please use getCurrentUserUseCase
 */
export const isAppExecutor = async (api: D2Api) => {
    const userRoles = await getUserRoles(api);
    const globalAdmin = await isGlobalAdmin(api);
    const { name } = AppRoles.SYNC_RULE_EXECUTION_ACCESS;

    return globalAdmin || !!userRoles.find((role: any) => role.name === name);
};

export const verifyUserHasAccessToSyncRule = async (api: D2Api, syncRule: SynchronizationRule | undefined) => {
    const globalAdmin = await isGlobalAdmin(api);
    if (globalAdmin) return true;

    const appConfigurator = await isAppConfigurator(api);
    const userInfo = await getUserInfo(api);

    const syncRuleVisibleToUser = syncRule?.isVisibleToUser(userInfo, "WRITE") ?? true;

    return appConfigurator && syncRuleVisibleToUser;
};

// TODO: Migrate to composition root set-up
export const initializeAppRoles = async (baseUrl: string) => {
    for (const role in AppRoles) {
        const { name, description, initialize } = AppRoles[role];
        if (initialize) {
            const { userRoles } = (
                await axios.get(baseUrl + "/api/metadata", {
                    withCredentials: true,
                    params: {
                        userRoles: true,
                        filter: `name:eq:${name}`,
                        fields: "id",
                    },
                })
            ).data as { userRoles?: { id: string }[] };

            if (!userRoles || userRoles.length === 0) {
                try {
                    await axios.post(
                        baseUrl + "/api/metadata.json",
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
                } catch (error: any) {
                    console.error(error);
                }
            }
        }
    }
};
