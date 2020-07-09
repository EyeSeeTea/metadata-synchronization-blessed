export function selectAllPeriods() {
    cy.get('[data-test="Select-period-dropdown-select"] > [tabindex="0"]').click();
    cy.get('[data-test="MenuItem-period-dropdown-select-element-fixed"]').click();
    cy.get('[data-test="Select-period-dropdown-select"] > [tabindex="0"]').click();
    cy.get('[data-test="MenuItem-period-dropdown-select-element-all"]').click();
    return this;
}
