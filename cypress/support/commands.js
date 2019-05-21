// <reference types="Cypress" />
/* global Cypress, cy */

import { externalUrl, generateFixtures, stubBackend } from "./network-fixtures";
import _ from "lodash";

const dhis2AuthEnvValue = Cypress.env("DHIS2_AUTH");
if (!dhis2AuthEnvValue) {
    throw new Error("CYPRESS_DHIS2_AUTH=user1:pass1[,user2:pass2,...] not set");
}

const dhis2Auth = _(dhis2AuthEnvValue)
    .split(",")
    .map(auth => auth.split(":"))
    .fromPairs()
    .value();

Cypress.Cookies.defaults({
    whitelist: "JSESSIONID",
});

Cypress.Commands.add("login", (username, _password = null) => {
    // Start server and create fixture for the encryption key
    cy.server();
    cy.fixture("app-config.json").then(json => cy.route("GET", "app-config.json", json));

    const password = _password || dhis2Auth[username];
    if (stubBackend) {
        cy.log(
            "Stubbing all backend network requests - unmatched requests will automatically fail"
        );
    } else {
        cy.log(`Performing end-to-end test with API server URL '${externalUrl}'`);
        if (generateFixtures) {
            cy.log("Generating fixtures from end-to-end network requests");
        }
    }
    if (!stubBackend) {
        cy.log("Login", { username });
        cy.request({
            method: "GET",
            url: `${externalUrl}/api/me`,
            auth: {
                user: username,
                pass: password,
            },
            log: true,
        });
    }
});

Cypress.on("window:before:load", win => {
    win.fetch = null;
});

Cypress.on("uncaught:exception", (err, runnable) => {
    // returning false here prevents Cypress from failing the test
    console.log("uncaught:exception", { err, runnable });
    return false;
});
