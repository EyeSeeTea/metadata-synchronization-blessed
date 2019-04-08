/** @format */

module.exports = {
    extends: [
        'react-app',
        'prettier',
        "eslint:recommended",
        "plugin:cypress/recommended",
        "plugin:@typescript-eslint/recommended"
    ],
    rules: {
        'no-console': 'off',
        "@typescript-eslint/camelcase": "off",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/explicit-member-accessibility": "off",
        "@typescript-eslint/no-explicit-any": "off",
    },
    plugins: [
        "cypress",
        "@typescript-eslint"
    ],
    env: {'cypress/globals': true},
    settings: {
        "react": {
            "pragma": "React",
            "version": "16.6.0"
        },
    },
};
