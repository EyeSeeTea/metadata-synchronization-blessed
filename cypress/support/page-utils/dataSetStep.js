export const routeName = "dataSets";

export function assertSelectedDatasetCountMessage(assert) {
    cy.wait(`@${routeName}`);
    assert(cy.contains("items selected in all pages"));
}

export function checkOnlySelectedItems() {
    activeRouteToWait();

    cy.contains("Only selected items").click();

    cy.wait(`@${routeName}`);
}

export function activeRouteToWait() {
    cy.route({
        method: "GET",
        url: "/api/dataSets*",
    }).as(routeName);
}
