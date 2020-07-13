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
        "@typescript-eslint/explicit-function-return-type": ["off"],
        "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
        "react/prop-types": "off",
        "react/display-name": "off",
        "no-unused-expressions": "off",
        "no-useless-concat": "off",
        "no-useless-constructor": "off",
        "default-case": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/ban-ts-ignore": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/indent": "off",
        "@typescript-eslint/member-delimiter-style": "off",
        "@typescript-eslint/type-annotation-spacing": "off",
        "@typescript-eslint/no-use-before-define": "off",
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
