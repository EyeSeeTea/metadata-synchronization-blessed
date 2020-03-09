export function assertSelectedEvent(event) {
    const getEventsRouteName = "getEvents";

    cy.route({
        method: "GET",
        url: "/api/events*",
    }).as(getEventsRouteName);

    cy.wait(`@${getEventsRouteName}`);

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
