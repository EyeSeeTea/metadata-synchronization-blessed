import _ from "lodash";
import React from "react";
import { concatStrings, generateTestId, isClassComponent, recursiveMap, removeParentheses, wrapType } from "./utils";

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
export const TestWrapper: React.FC<TestWrapperProps> = ({ children, namespace, attributeName, componentParent }) => {
    const testAttributeName = attributeName || `data-test`;

    function withTestAttribute(nodes: React.ReactNode, parentId?: string) {
        const node = React.Children.only(nodes) as any;
        const { type, props } = node;
        if (isClassComponent(type)) return node;

        const id = generateTestId(node);
        const className = removeParentheses(type.displayName || type.name || type);
        const testAttribute = concatStrings([className, namespace, componentParent, parentId, id]);
        const children = _.flatten([props.children]);
        const element = props["data-test-wrapped"]
            ? node
            : React.createElement(wrapType(type, parentId), props, ...children);

        const count = dataTestDictionary.get(testAttribute) ?? 0;
        const testId = concatStrings([testAttribute, count > 1 ? String(count) : undefined]);
        const dataTest = props[testAttributeName] ?? testId;
        const isReactFragment = element.type.toString() === "Symbol(react.fragment)";
        // TODO: Disabled for now
        // dataTestDictionary.set(testAttribute, count + 1);

        return isReactFragment
            ? element
            : React.cloneElement(element, {
                  [testAttributeName]: isReactFragment ? undefined : dataTest,
              });
    }

    return (
        <React.Fragment>
            {process.env.REACT_APP_CYPRESS ? recursiveMap(children, withTestAttribute) : children}
        </React.Fragment>
    );
};
