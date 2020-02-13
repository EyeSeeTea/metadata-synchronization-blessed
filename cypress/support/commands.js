// <reference types="Cypress" />
/* global Cypress, cy */

import _ from "lodash";

const externalUrl = Cypress.env("EXTERNAL_API");
const appUrl = Cypress.env("ROOT_URL");
const dhis2AuthEnvValue = Cypress.env("DHIS2_AUTH");

if (!dhis2AuthEnvValue) {
    throw new Error("CYPRESS_DHIS2_AUTH=user1:pass1[,user2:pass2,...] not set");
}

if (!externalUrl) {
    throw new Error("CYPRESS_EXTERNAL_API not set");
}

if (!appUrl) {
    throw new Error("CYPRESS_ROOT_URL not set");
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
    const password = _password || dhis2Auth[username];

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
});

Cypress.on("window:before:load", win => {
    win.fetch = null;
});

Cypress.on("uncaught:exception", (err, runnable) => {
    // returning false here prevents Cypress from failing the test
    console.log("uncaught:exception", { err, runnable });
    return false;
});

Cypress.Commands.add("waitForStep", stepName => {
    cy.contains(stepName).should($el => {
        console.log($el);
        expect($el.attr("class")).to.contain("current-step", `Current step should be ${stepName}`);
    });
});

Cypress.Commands.add("selectInMultiSelector", (selector, option) => {
    cy.get(selector + " > div select:first").select(option);
    cy.contains("Selected")
        .next("button")
        .click();
});

Cypress.Commands.add("selectInOrgUnitTree", label => {
    cy.contains(label)
        .find("input")
        .click();
    cy.contains(label)
        .should("have.css", "color")
        .and("equal", "rgb(255, 165, 0)");
});
