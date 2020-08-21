export function assertSelectedOrgUnit(assert) {
    const getOrgUnitsRouteName = "getOrgUnits";

    cy.route({
        method: "GET",
        url: "/api/organisationUnits*",
    }).as(getOrgUnitsRouteName);
    cy.wait(`@${getOrgUnitsRouteName}`);

    assert(cy.get(".ou-root * > div[style*='color: orange;'"));
}

export function selectOrgUnit(container, orgUnit) {
    cy.get(container).selectInOrgUnitTree(orgUnit);

    return this;
}

export function expandOrgUnit(container, orgUnit) {
    cy.get(container).expandInOrgUnitTree(container, orgUnit);

    return this;
}
