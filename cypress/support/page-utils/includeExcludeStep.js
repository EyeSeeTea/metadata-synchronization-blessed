export function getMetadataRouteName() {
    const getMetadata = "getMetadata";
    cy.route({
        method: "GET",
        url: "/api/metadata*",
    }).as(getMetadata);

    return getMetadata;
}

export function changeUseDefaultConfiguration(getMetadataRouteName) {
    cy.wait(`@${getMetadataRouteName}`);

    cy.get(".MuiSwitch-root").click();
}

export function selectMetadataType(cotainerSelector, text) {
    cy.selectInDropdown(cotainerSelector, "Metadata type", text);
}

export function excludeRule(cotainerSelector, rule) {
    cy.unselectInMultiSelector(cotainerSelector, rule);
}
