export function assertSelectedDatasetCountMessage(assert) {
    assert(cy.contains("items selected in all pages"));
    return this;
}

export function checkOnlySelectedItems() {
    const getDataSetsRouteName = "getDataSets";

    cy.route({
        method: "GET",
        url: "/api/dataSets*",
    }).as(getDataSetsRouteName);

    cy.contains("Only selected items").click();

    cy.wait(`@${getDataSetsRouteName}`);
    return this;
}
