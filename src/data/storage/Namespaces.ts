export const Namespace = {
    MODULES: "modules",
    IMPORTEDPACKAGES: "imported-packages",
    PACKAGES: "packages",
    INSTANCES: "instances",
    RULES: "rules",
    HISTORY: "history",
    NOTIFICATIONS: "notifications",
    CONFIG: "config",
    STORES: "stores",
    RESPONSIBLES: "responsibles",
    MAPPINGS: "mappings",
    SCHEDULER_EXECUTIONS: "scheduler-executions",
};

export const NamespaceProperties: Record<string, string[]> = {
    [Namespace.MODULES]: [],
    [Namespace.PACKAGES]: ["contents"],
    [Namespace.IMPORTEDPACKAGES]: ["contents"],
    [Namespace.INSTANCES]: ["metadataMapping", "password", "username"],
    [Namespace.MAPPINGS]: ["mappingDictionary"],
    [Namespace.RULES]: ["builder"],
    [Namespace.HISTORY]: [],
    [Namespace.NOTIFICATIONS]: ["payload"],
    [Namespace.CONFIG]: [],
    [Namespace.STORES]: [],
    [Namespace.RESPONSIBLES]: [],
};
