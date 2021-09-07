import _ from "lodash";

export const RegularExpression = {
    // Match group between brackets #{template}
    DATA_ELEMENT: /#\{([^{].*?)(?:\.([^{].*?))?\}/g,
};

export function interpolate(string: string, dictionary: Record<string, string>): string {
    return string.replace(RegularExpression.DATA_ELEMENT, (_match, dataElement, categoryOption) =>
        _.compact([dataElement, categoryOption].map(key => dictionary[key] ?? key)).join(".")
    );
}

export function getTemplates(string: string): string[] {
    const match = string.matchAll(RegularExpression.DATA_ELEMENT);
    return _.compact(Array.from(match).flatMap(results => results.slice(1)));
}
