const cypress = require("cypress");
const yargs = require("yargs");
const { merge } = require("mochawesome-merge");
const marge = require("mochawesome-report-generator");
const rm = require("rimraf");
const cypressConfig = require("../../cypress.json");
const fs = require("fs");

const argv = yargs
    .options({
        browser: {
            alias: "b",
            describe: "choose browser that you wanna run tests on",
            default: "electron",
            choices: ["chrome", "electron"],
        },
        spec: {
            alias: "s",
            describe: "run test with specific spec file",
            default: "cypress/integration/*.spec.js",
        },
    })
    .help().argv;

const pr = process.env.TRAVIS_PULL_REQUEST !== "false" && process.env.TRAVIS_PULL_REQUEST;
const branch = process.env.TRAVIS_BRANCH ? process.env.TRAVIS_BRANCH : "default";
const subfolder = pr ? `pr/${pr}` : `branch/${branch.split("/").join("-")}`;
const pagesPath = `${subfolder}/${process.env.TRAVIS_COMMIT}`;
const reportDir = `test-report/${pagesPath}`;

fs.writeFile("pages_path", pagesPath, function(err) {
    if (err) console.log(err);
});

// Delete all existing report files
rm(`${cypressConfig.reporterOptions.reportDir}/*.json`, error => {
    if (error) {
        console.error(`Error while removing existing report files: ${error}`);
        process.exit(1);
    }
});

// Run cypress tests and generate report
cypress
    .run({
        browser: argv.browser,
        spec: argv.spec,
        headless: true,
        config: {
            video: true,
            screenshotsFolder: `${reportDir}/assets/screenshots`,
            videosFolder: `${reportDir}/assets/videos`,
            parallel: true,
            ciBuildId: process.env.TRAVIS_BUILD_ID,
        },
    })
    .then(_results => {
        generateReport({
            reportDir,
            reportFilename: "index",
            charts: true,
        });
    })
    .catch(error => {
        console.error("errors: ", error);
        process.exit(1);
    });

function generateReport(options) {
    return merge(options).then(report => {
        marge.create(report, options);
    });
}
