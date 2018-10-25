module.exports = {
    setupTestFrameworkScriptFile: '<rootDir>/src/config/testSetup.js',
    collectCoverageFrom: ['src/**/*.js'],
    testPathIgnorePatterns: ['/node_modules/'],
    transformIgnorePatterns: ['/node_modules/(?!d2-ui).+\\.js$'],
    moduleNameMapper: {
        '\\.(css)$': '<rootDir>/src/config/styleMock.js',
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
