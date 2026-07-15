const reactAppConfig = require("eslint-config-react-app");

const reactAppRestrictedGlobals = reactAppConfig.rules["no-restricted-globals"] || [];
// Override no-restricted-globals to exclude 'name'. Review this rule if causes new issues
const restrictedGlobals = reactAppRestrictedGlobals.filter(global => global !== "name");

module.exports = {
    extends: ["react-app"],
    parser: "@typescript-eslint/parser",
    ignorePatterns: ["src/**/snapshots/*.ts", ".eslintrc.js"],
    rules: {
        "no-console": ["warn", { allow: ["debug", "warn", "error"] }],
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/no-unused-vars": [
            "warn",
            {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
            },
        ],
        "unused-imports/no-unused-imports": "warn",
        "react/prop-types": "off",
        "react/display-name": "off",
        "react/react-in-jsx-scope": "off",
        "no-unused-expressions": "off",
        "no-useless-concat": "off",
        "no-useless-constructor": "off",
        "no-unexpected-multiline": "off",
        "default-case": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/ban-ts-ignore": "off",
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/indent": "off",
        "@typescript-eslint/member-delimiter-style": "off",
        "@typescript-eslint/type-annotation-spacing": "off",
        "no-use-before-define": "off",
        "no-debugger": "warn",
        "no-extra-semi": "off",
        "no-mixed-spaces-and-tabs": "off",
        "no-useless-rename": "off",
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
        "testing-library/await-async-query": "off",
        "testing-library/no-await-sync-query": "off",
        "testing-library/prefer-screen-queries": "off",
        "testing-library/no-debugging-utils": "off",
        "testing-library/no-dom-import": "off",
        "no-restricted-globals": restrictedGlobals,
    },
    plugins: ["unused-imports"],
    parserOptions: {
        project: "./tsconfig.json",
    },
    settings: {
        react: {
            pragma: "React",
            version: "17.0.2",
        },
    },
};
