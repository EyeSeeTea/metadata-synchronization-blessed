export function assertSelectedEvent(event) {
    assert(
        cy
            .get('[data-test="Paper"]')
            .contains(event)
            .prev()
            .find("[checked]")
    );
}

export function selectEvent(container, event) {
    cy.get(container)
        .contains(event)
        .parent()
        .click();
    return this;
}
