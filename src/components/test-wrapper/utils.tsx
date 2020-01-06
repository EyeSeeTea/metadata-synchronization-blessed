import _ from "lodash";
import React from "react";
import { TestWrapper } from "./TestWrapper";

export function recursiveMap(
    children: React.ReactNode,
    fn: Function,
    parentId?: string
): React.ReactNode {
    return React.Children.map(children, child => {
        const id = concatStrings([parentId, generateTestId(child || {})]);
        if (!React.isValidElement(child)) {
            return child;
        }

        const clone = child.props.children
            ? React.cloneElement(child, {
                  children: recursiveMap(child.props.children, fn, id),
              })
            : child;

        return fn(clone, id);
    });
}

export function concatStrings(
    strings: (string | undefined)[],
    separator = "-",
    duplicates = false
) {
    return _(strings)
        .map(string => (duplicates ? string : string?.split(separator)))
        .flatten()
        .compact()
        .uniq()
        .join(separator);
}

export function generateTestId({ props = {}, key }: { props?: any; key?: string }) {
    const id = _.kebabCase(_.toLower(props.id || props.title || props.name || key));
    return !!id ? id : undefined;
}

export function removeParentheses(string: string) {
    if (typeof string !== "string") return undefined;
    const result = string.substring(string.lastIndexOf("(") + 1, string.indexOf(")"));
    return !!result ? result : string;
}

export function isClassComponent(component: any) {
    return typeof component === "function" && !!component.prototype.isReactComponent ? true : false;
}

export function wrapType(type: any, parentId?: string) {
    return typeof type === "function" && !isClassComponent(type)
        ? (...props: any[]) => {
              return <TestWrapper componentParent={parentId}>{type(...props)}</TestWrapper>;
          }
        : type;
}
