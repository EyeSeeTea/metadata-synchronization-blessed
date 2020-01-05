import _ from "lodash";
import React from "react";
import { TestWrapper } from "./TestWrapper";

export function recursiveMap(
    children: React.ReactNode,
    fn: Function,
    parent?: React.ReactNode
): React.ReactNode {
    return React.Children.map(children, child => {
        if (!React.isValidElement(child)) {
            return child;
        }

        const clone = child.props.children
            ? React.cloneElement(child, {
                  children: recursiveMap(child.props.children, fn, child),
              })
            : child;

        return fn(clone, parent);
    });
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

export function wrapType(type: any) {
    return typeof type === "function" && !isClassComponent(type)
        ? (...props: any[]) => {
              return <TestWrapper>{type(...props)}</TestWrapper>;
          }
        : type;
}
