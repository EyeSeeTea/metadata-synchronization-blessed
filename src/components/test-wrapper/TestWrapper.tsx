import _ from "lodash";
import React from "react";
import {
    generateTestId,
    isClassComponent,
    recursiveMap,
    removeParentheses,
    wrapType,
} from "./utils";

interface TestWrapperProps {
    namespace?: string;
    attributeName?: string;
}

/**
 * A wrapper that recursively adds `data-test` attributes to children and render components.
 *
 * Disclaimer:
 *   - This only supports functional components (HOCs and class components won't be supported)
 *
 * Implementation based on:
 *   - https://github.com/dennismorello/react-test-attributes/blob/master/src/components/TestAttribute.tsx
 *   - https://github.com/ctrlplusb/react-tree-walker/blob/master/src/index.js
 */
export const TestWrapper: React.FC<TestWrapperProps> = ({ children, namespace, attributeName }) => {
    const testAttributeName = attributeName || `data-test`;
    const isProduction = process.env.NODE_ENV === "production";

    function withTestAttribute(nodes: React.ReactNode, parent?: React.ReactNode) {
        const node = React.Children.only(nodes) as any;
        const { type, props } = node;
        const id = generateTestId(node);
        const parentId = generateTestId(parent || {});
        const className = removeParentheses(type.displayName || type.name || type);
        const testAttribute = _.compact([namespace, className, parentId, id]).join("-");
        const children = _.flatten([props.children]);

        const element = React.createElement(wrapType(type), props, ...children);
        if (!isClassComponent(type) && !!id) {
            if (typeof type === "function") {
                return React.createElement("span", { [testAttributeName]: testAttribute }, element);
            } else {
                return React.cloneElement(element, {
                    [testAttributeName]: testAttribute,
                });
            }
        } else {
            return element;
        }
    }

    return (
        <React.Fragment>
            {isProduction ? children : recursiveMap(children, withTestAttribute)}
        </React.Fragment>
    );
};
