// <reference types="Cypress" />

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

Cypress.config("baseUrl", appUrl);

const dhis2Auth = _(dhis2AuthEnvValue)
    .split(",")
    .map(auth => auth.split(":"))
    .fromPairs()
    .value();

Cypress.Cookies.defaults({
    whitelist: "JSESSIONID",
});

const timeout = ms => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

Cypress.Commands.overwrite("get", async (originalFn, selector, options) => {
    let element;
    let detached;
    let retries = 0;

    do {
        element = await originalFn(selector, options);
        await timeout(350);
        detached = Cypress.dom.isDetached(element);
        retries += 1;

        if (detached) {
            Cypress.log({
                name: "Get",
                displayName: "Get",
                message: "Element is detached from DOM",
                // eslint-disable-next-line no-loop-func
                consoleProps: () => ({ selector, retries }),
            });
        }
    } while (detached && retries < 15);

    return element;
});

const encryptionKey = Cypress.env("ENCRYPTION_KEY");
Cypress.Commands.add("login", (username, _password = null) => {
    // Start server and create fixture for the encryption key
    cy.server();
    cy.fixture("app-config.json").then(json => {
        if (encryptionKey) json.encryptionKey = encryptionKey;
        cy.route("GET", "app-config.json", json);
    });

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
    console.error("uncaught:exception", { err, runnable });
    return false;
});

Cypress.Commands.add("waitForStep", stepName => {
    cy.contains(stepName).should($el => {
        expect($el.attr("class")).to.contain("current-step", `Current step should be ${stepName}`);
    });
});

Cypress.Commands.add("selectInMultiSelector", (selector, option) => {
    cy.get(selector + " > div select:first").select(option);
    cy.contains("Selected").next("button").click();
});

Cypress.Commands.add("unselectInMultiSelector", (containerSelector, option) => {
    const selector = containerSelector ? containerSelector + " > div select:last" : "select:last";

    cy.get(selector).select(option);
    cy.contains("Selected").next("button").next("button").click();
});

Cypress.Commands.add("selectInOrgUnitTree", label => {
    cy.contains(label).find("input").click();
    cy.contains(label).should("have.css", "color").and("equal", "rgb(255, 165, 0)");
});

Cypress.Commands.add("expandInOrgUnitTree", (container, orgUnit) => {
    cy.get(container).contains(orgUnit).parent().parent().contains("▸").click();
});

Cypress.Commands.add("selectRowInTableByText", text => {
    cy.get("table").contains(text).click();
});

Cypress.Commands.add("checkRowCheckboxByText", text => {
    cy.get("table").contains(text).parent().find("input").click();
});

Cypress.Commands.add("selectFilterInTable", (filterLabel, filterValue) => {
    cy.selectInDropdown("#app", filterLabel, filterValue);
});

Cypress.Commands.add("selectInDropdown", (containerSelector, label, option) => {
    const parent = containerSelector ? cy.get(containerSelector) : cy;

    parent.contains(label).parent().click();

    cy.get('[role="listbox"]').contains(option).click();
});
