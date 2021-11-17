module.exports = {
    collectCoverageFrom: ["src/**/*.js"],
    testPathIgnorePatterns: ["/node_modules/", "/cypress"],
    transformIgnorePatterns: ["/node_modules/(?!@eyeseetea/d2-ui-components)"],
    modulePaths: ["src"],
    moduleDirectories: ["node_modules"],
    moduleNameMapper: {
        "\\.(css|scss)$": "<rootDir>/config/styleMock.js",
        "\\.(jpg|jpeg|png|svg)$": "<rootDir>/config/fileMock.js",
    },
    setupFilesAfterEnv: ["<rootDir>/config/testSetup.js"],
    transform: {
        "^.+\\.[t|j]sx?$": "babel-jest",
    },
    testRegex: "((\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    testEnvironment: "jsdom",
    globals: {
        window: true,
        document: true,
        navigator: true,
        Element: true,
    },
};
