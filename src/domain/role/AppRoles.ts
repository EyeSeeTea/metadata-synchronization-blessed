type AppRole = { name: string; description: string; initialize: boolean };

function role(role: AppRole): AppRole {
    return role;
}

export const AppRoles: {
    [key: string]: AppRole;
} = {
    CONFIGURATION_ACCESS: role({
        name: "METADATA_SYNC_CONFIGURATOR",
        description:
            "APP - This role allows to create new instances and synchronization rules in the Metadata Sync app",
        initialize: true,
    }),
    SYNC_RULE_EXECUTION_ACCESS: role({
        name: "METADATA_SYNC_EXECUTOR",
        description: "APP - This role allows to execute synchronization rules in the Metadata Sync app",
        initialize: true,
    }),
    SHOW_DELETED_OBJECTS: role({
        name: "METADATA_SYNC_SHOW_DELETED_OBJECTS",
        description: "APP - This role allows the user to synchronize deleted objects",
        initialize: false,
    }),
};
