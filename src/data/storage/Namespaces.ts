export type Namespace = typeof Namespace[keyof typeof Namespace];

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
};

export const NamespaceProperties: Record<Namespace, string[]> = {
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
