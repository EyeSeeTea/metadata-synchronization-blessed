export type Namespace = typeof Namespace[keyof typeof Namespace];

export const Namespace = {
    MODULES: "modules",
    PACKAGES: "packages",
    INSTANCES: "instances",
    RULES: "rules",
    HISTORY: "history",
    NOTIFICATIONS: "notifications",
    CONFIG: "config",
    STORES: "stores",
    RESPONSIBLES: "responsibles",
};

export const NamespaceProperties: Record<Namespace, string[]> = {
    [Namespace.MODULES]: [],
    [Namespace.PACKAGES]: ["contents"],
    [Namespace.INSTANCES]: ["metadataMapping"],
    [Namespace.RULES]: [],
    [Namespace.HISTORY]: [],
    [Namespace.NOTIFICATIONS]: ["payload"],
    [Namespace.CONFIG]: [],
    [Namespace.STORES]: [],
    [Namespace.RESPONSIBLES]: [],
};
