module.exports = {
    setupTestFrameworkScriptFile: '<rootDir>/config/testSetup.js',
    collectCoverageFrom: ['src/**/*.js'],
    testPathIgnorePatterns: ['/node_modules/', '/cypress'],
    transformIgnorePatterns: ['/node_modules/(?!@dhis2)'],
    modulePaths: ['src'],
    moduleNameMapper: {
        '\\.(css|scss)$': '<rootDir>/config/styleMock.js',
        '\\.(jpg|jpeg|png|svg)$': '<rootDir>/config/fileMock.js',
    },
    testEnvironment: 'jsdom',
    globals: {
        window: true,
        document: true,
        navigator: true,
        Element: true,
    },
    snapshotSerializers: ['enzyme-to-json/serializer'],
}
