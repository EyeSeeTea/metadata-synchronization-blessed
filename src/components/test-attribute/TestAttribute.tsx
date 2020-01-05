import React from "react";
import _ from "lodash";

function recursiveMap(
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

function generateTestId({ props, key }: { props?: any; key?: string }) {
    const id = _.kebabCase(
        _.toLower(props?.id || props?.title || props?.displayName || props?.name || key)
    );
    return !!id ? id : undefined;
}

interface TestAttributeProps {
    namespace?: string;
    attributeName?: string;
}

/**
 * Based on https://github.com/dennismorello/react-test-attributes/blob/master/src/components/TestAttribute.tsx
 */
export const TestAttribute: React.FC<TestAttributeProps> = ({
    children,
    namespace,
    attributeName,
}) => {
    const testAttributeName = attributeName || `data-test`;
    const isProduction = process.env.NODE_ENV === "production";

    function withTestAttribute(nodes: React.ReactNode, parent?: React.ReactNode) {
        const node = React.Children.only(nodes) as any;
        const className = node.type.displayName || node.type.name || node.type;
        const parentId = generateTestId(parent || {});
        const id = generateTestId(node);

        if (!!id) {
            const testAttribute = _.compact([namespace, className, parentId, id]).join("-");
            return React.createElement("div", { [testAttributeName]: testAttribute }, node);
        } else {
            return node;
        }
    }

    return (
        <React.Fragment>
            {isProduction ? children : recursiveMap(children, withTestAttribute)}
        </React.Fragment>
    );
};
