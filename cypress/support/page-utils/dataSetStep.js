export const routeName = "dataSets";

export function assertSelectedDatasetCountMessage(assert) {
    cy.wait(`@${routeName}`);
    assert(cy.contains("items selected in all pages"));
}

export function checkOnlySelectedItems() {
    activeRouteToWait();

    cy.contains("Only selected items")
        .parent()
        .find("input")
        .click();

    cy.wait(`@${routeName}`);

    cy.contains("items selected in all pages");
}

export function activeRouteToWait() {
    cy.route({
        method: "GET",
        url: "/api/dataSets*",
    }).as(routeName);
}
