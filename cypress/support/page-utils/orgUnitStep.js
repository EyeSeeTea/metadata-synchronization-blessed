export function assertSelectedOrgUnit(assert) {
    const getOrgUnitsRouteName = "getOrgUnits";

    cy.route({
        method: "GET",
        url: "/api/organisationUnits*",
    }).as(getOrgUnitsRouteName);
    cy.wait(`@${getOrgUnitsRouteName}`);

    assert(cy.get(".ou-root .label > div[style*='color: orange;'"));
}
