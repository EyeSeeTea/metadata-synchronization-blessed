// eslint-disable-next-line
const cypress = require("cypress");
// eslint-disable-next-line
const yargs = require("yargs");
// eslint-disable-next-line
const { merge } = require("mochawesome-merge");
// eslint-disable-next-line
const marge = require("mochawesome-report-generator");
// eslint-disable-next-line
const rm = require("rimraf");
// eslint-disable-next-line
const cypressConfig = require("../../cypress.json");
// eslint-disable-next-line
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
const pagesPath = `${process.env.TRAVIS_REPO_SLUG}/${subfolder}/${process.env.TRAVIS_COMMIT}`;
const reportDir = `feedback-ci/${pagesPath}`;

fs.writeFile("pages_path", pagesPath, function (err) {
    if (err) console.error(err);
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
            videoUploadOnPasses: false,
            screenshotsFolder: `${reportDir}/assets/screenshots`,
            videosFolder: `${reportDir}/assets/videos`,
            parallel: true,
            ciBuildId: process.env.TRAVIS_BUILD_ID,
        },
    })
    .then(result => {
        return generateReport({
            reportDir,
            reportFilename: "index",
            charts: true,
            result,
        });
    })
    .catch(error => {
        console.error("errors: ", error);
        process.exit(1);
    });

function generateReport(options) {
    return merge(options).then(report => {
        marge.create(report, options).then(() => {
            process.exit(options.result.totalFailed);
        });
    });
}
