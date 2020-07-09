export function selectReceiverInstance(conatinerSelector, instance) {
    cy.selectInMultiSelector(conatinerSelector, instance);
}

export function assertSelectedInstances(assert) {
    assert(cy.get("select:last"));
}
