import { dataTest } from "../utils";

export function selectAllAttributesCategoryOptions() {
    cy.get('[data-test="FormControlLabel-sync-all-attribute-category-options"] > :nth-child(2)').click();
    cy.get(dataTest("group-editor-assign-all")).click();
}
