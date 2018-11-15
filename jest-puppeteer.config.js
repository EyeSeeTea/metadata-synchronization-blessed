const url = require('url')

const headless = process.env.HEADLESS !== 'false'
const dhis2Url =
    process.env.REACT_APP_DHIS2_URL_TEST || 'https://play.dhis2.org/dev'
const appUrl = process.env.REACT_APP_URL_TEST || 'http://localhost:9000'
const port = parseInt(url.parse(appUrl).port || 80, 10)
const startServer = process.env.START_SERVER !== 'false'
const serverCommand = `REACT_APP_DHIS2_URL=${dhis2Url} REACT_APP_URL_TEST=${appUrl} PORT=${port} yarn start`

module.exports = {
    launch: {
        dumpio: true,
        headless: headless,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
    browserContext: 'default',
    server: !startServer ? undefined : {
        command: serverCommand,
        port: port,
        launchTimeout: 30 * 1000,
    },
    config: { dhis2Url, appUrl },
}
