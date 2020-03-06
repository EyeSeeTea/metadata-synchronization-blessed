export function selectEvent(container, event) {
    cy.get(container)
        .contains(event)
        .parent()
        .click();
    return this;
}
