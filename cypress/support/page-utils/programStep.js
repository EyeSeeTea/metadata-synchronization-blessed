export const routeName = "programs";
export function assertSelectedProgramsCountMessage(assert) {
    cy.wait(`@${routeName}`);
    assert(cy.contains("items selected in all pages"));
}

export function activeRouteToWait() {
    cy.route({
        method: "GET",
        url: "/api/programs*",
    }).as(routeName);
}

export function checkOnlySelectedItems() {
    activeRouteToWait();

    cy.contains("Only selected items")
        .parent()
        .find("input")
        .click();

    cy.contains("items selected in all pages");
}
