import { Instance } from "../../domain/instance/entities/Instance";
import { User } from "../../domain/user/entities/User";
import { UserRepository } from "../../domain/user/repositories/UserRepository";
import { D2Api } from "../../types/d2-api";
import { getD2APiFromInstance } from "../../utils/d2-utils";

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

export class UserD2ApiRepository implements UserRepository {
    private api: D2Api;

    constructor(instance: Instance) {
        this.api = getD2APiFromInstance(instance);
    }

    async getCurrent(): Promise<User> {
        const currentUser = await this.api.currentUser
            .get({
                fields: {
                    id: true,
                    name: true,
                    email: true,
                    userCredentials: {
                        username: true,
                        userRoles: {
                            $all: true,
                        },
                    },
                    userGroups: { id: true, name: true },
                    organisationUnits: { id: true, name: true },
                    dataViewOrganisationUnits: { id: true, name: true },
                },
            })
            .getData();

        const isGlobalAdmin = !!currentUser.userCredentials.userRoles.find((role: any) =>
            role.authorities.find((authority: string) => authority === "ALL")
        );

        return {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            username: currentUser.userCredentials.username,
            userGroups: currentUser.userGroups,
            organisationUnits: currentUser.organisationUnits,
            dataViewOrganisationUnits: currentUser.dataViewOrganisationUnits,
            isGlobalAdmin,
            isAppConfigurator:
                isGlobalAdmin ||
                !!currentUser.userCredentials.userRoles.find(
                    (role: any) => role.name === AppRoles.CONFIGURATION_ACCESS.name
                ),
            isAppExecutor:
                isGlobalAdmin ||
                !!currentUser.userCredentials.userRoles.find(
                    (role: any) => role.name === AppRoles.SYNC_RULE_EXECUTION_ACCESS.name
                ),
        };
    }
}
