export function selectOrgUnit(container, orgUnit) {
    cy.get(container).selectInOrgUnitTree(orgUnit);

    return this;
}
