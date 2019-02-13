// <reference types="Cypress" />
/* global Promise, Cypress, cy */

import { stubFetch, externalUrl, generateFixtures, stubBackend } from "./network-fixtures";
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

Cypress.Commands.add("login", (username, _password = null) => {
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
        cy.log("Login", { username, password });
        cy.request({
            method: "POST",
            url: `${externalUrl}/dhis-web-commons-security/login.action`,
            body: {
                j_username: username,
                j_password: password,
            },
            form: true,
            log: true,
        });
    }
});

Cypress.Commands.add("persistLogin", () => {
    Cypress.Cookies.preserveOnce("JSESSIONID");
});

Cypress.Commands.add("loadPage", (path = "/") => {
    cy.visit(path, { onBeforeLoad: stubFetch });
    cy.get("#app", { log: false, timeout: 20000 }); // Waits for the page to fully load
    if (generateFixtures) {
        //Make sure all the delayed network requests get captured
        //cy.wait(1000);
    }
});

Cypress.on("uncaught:exception", (err, runnable) => {
    // returning false here prevents Cypress from failing the test
    //console.log("uncaught:exception", {err, runnable});
    return false;
});
