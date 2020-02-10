/** @format */

module.exports = {
    extends: [
        "react-app",
        "prettier",
        "eslint:recommended",
        "plugin:cypress/recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    rules: {
        "no-console": "off",
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/explicit-member-accessibility": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/indent": "off",
        "@typescript-eslint/member-delimiter-style": "off",
        "@typescript-eslint/type-annotation-spacing": "off",
        "@typescript-eslint/no-use-before-define": [
            "error",
            { functions: false, classes: true, variables: true },
        ],
        "@typescript-eslint/explicit-function-return-type": "off",
        "no-extra-semi": "off",
        "no-mixed-spaces-and-tabs": "off",
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
    },
    plugins: ["cypress", "@typescript-eslint", "react-hooks"],
    env: { "cypress/globals": true },
    settings: {
        react: {
            pragma: "React",
            version: "16.6.0",
        },
    },
};
