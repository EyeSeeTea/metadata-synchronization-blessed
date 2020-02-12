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

Cypress.Commands.add("login", (username, _password = null) => {
    const password = _password || dhis2Auth[username];

    cy.log("Login", { username, password });
    cy.request({
        method: "POST",
        url: `${externalUrl}/dhis-web-commons-security/login.action`,
        body: {
            /* eslint-disable @typescript-eslint/camelcase*/
            j_username: username,
            j_password: password,
        },
        form: true,
        log: true,
    });
});

Cypress.Commands.add("persistLogin", () => {
    Cypress.Cookies.preserveOnce("JSESSIONID");
});

const stubFetch = win => {
    delete win.fetch;
};

Cypress.Commands.add("loadPage", (path = appUrl) => {
    cy.visit(path, {
        onBeforeLoad: stubFetch,
    });
    cy.get("#app", { log: false, timeout: 20000 }); // Waits for the page to fully load
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
