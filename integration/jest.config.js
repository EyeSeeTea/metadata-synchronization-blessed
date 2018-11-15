module.exports = {
    setupTestFrameworkScriptFile: '<rootDir>/testSetup.js',
    preset: 'jest-puppeteer',
    testRegex: './*\\.spec\\.js$',
    globalSetup: './global-setup.js',
}
