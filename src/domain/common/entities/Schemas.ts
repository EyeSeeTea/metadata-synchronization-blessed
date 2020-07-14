export type Id = string;

export interface Access {
    read: boolean;
    update: boolean;
    externalize: boolean;
    delete: boolean;
    write: boolean;
    manage: boolean;
}

export interface Translation {
    property: string;
    locale: string;
    value: string;
}

export interface Style {
    color: string;
    icon: string;
}

export interface Expression {
    expression: string;
    description: string;
    missingValueStrategy: "NEVER_SKIP" | "SKIP_IF_ANY_VALUE_MISSING" | "SKIP_IF_ALL_VALUES_MISSING";
    slidingWindow: boolean;
}
