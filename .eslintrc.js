/** @format */

module.exports = {
    extends: [
        'react-app',
        'prettier',
        "plugin:cypress/recommended"
    ],
    rules: {
        'no-console': 'off',
    },
    plugins: [
        "cypress"
    ],
    env: {'cypress/globals': true},
    settings: {
        "react": {
            "pragma": "React",
            "version": "16.6.0"
        },
    },
};
