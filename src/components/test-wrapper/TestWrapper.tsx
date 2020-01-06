import _ from "lodash";
import React from "react";
import {
    generateTestId,
    isClassComponent,
    recursiveMap,
    removeParentheses,
    wrapType,
    concatStrings,
} from "./utils";

interface TestWrapperProps {
    namespace?: string;
    attributeName?: string;
    componentParent?: string;
}

const dataTestDictionary = new Map();

/**
 * A wrapper that recursively adds `data-test` attributes to children and render components.
 *
 * Disclaimer:
 *   - This only "modern" functional components (HOCs and class components might not work as expected)
 *
 * Implementation based on:
 *   - https://github.com/dennismorello/react-test-attributes/blob/master/src/components/TestAttribute.tsx
 *   - https://github.com/ctrlplusb/react-tree-walker/blob/master/src/index.js
 */
export const TestWrapper: React.FC<TestWrapperProps> = ({
    children,
    namespace,
    attributeName,
    componentParent,
}) => {
    const testAttributeName = attributeName || `data-test`;
    const isProduction = process.env.NODE_ENV === "production";

    function withTestAttribute(nodes: React.ReactNode, parentId?: string) {
        const node = React.Children.only(nodes) as any;
        const { type, props } = node;
        if (isClassComponent(type)) return node;

        const id = generateTestId(node);
        const className = removeParentheses(type.displayName || type.name || type);
        const testAttribute = concatStrings([className, namespace, componentParent, parentId, id]);
        const children = _.flatten([props.children]);
        const element = React.createElement(wrapType(type, parentId), props, ...children);

        const count = dataTestDictionary.get(testAttribute) ?? 0;
        const testId = concatStrings([testAttribute, count > 1 ? String(count) : undefined]);
        dataTestDictionary.set(testAttribute, count + 1);

        return React.cloneElement(element, {
            [testAttributeName]: props[testAttributeName] ?? testId,
        });
    }

    return (
        <React.Fragment>
            {isProduction ? children : recursiveMap(children, withTestAttribute)}
        </React.Fragment>
    );
};
