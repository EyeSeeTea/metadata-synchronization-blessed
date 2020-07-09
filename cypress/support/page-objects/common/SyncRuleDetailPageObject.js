import * as instanceSelectionStep from "../../page-utils/instanceSelectionStep";
import { dataTest } from "../../utils";
import PageObject from "./PageObject";

export default class SyncRuleDetailPageObject extends PageObject {
    assertName(assert) {
        assert(this.cy.get(dataTest("name")));
        return this;
    }

    assertCode(assert) {
        assert(this.cy.get(dataTest("code")));
        return this;
    }

    assertDescription(assert) {
        assert(this.cy.get(dataTest("description")));
        return this;
    }

    typeName(text) {
        this.cy
            .get(dataTest("name"))
            .type(text)
            .blur();
        return this;
    }

    typeCode(text) {
        this.cy
            .get(dataTest("code"))
            .type(text)
            .blur();
        return this;
    }

    typeDescription(text) {
        this.cy
            .get(dataTest("description"))
            .type(text)
            .blur();
        return this;
    }

    selectRow(text) {
        this.cy.selectRowInTableByText(text);
        return this;
    }

    selectFilterInTable(filterLabel, filterValue) {
        cy.selectFilterInTable(filterLabel, filterValue);
        return this;
    }

    next() {
        this.cy.get('[data-test="Button-next-→"]').click();
        return this;
    }

    selectReceiverInstance(instance) {
        instanceSelectionStep.selectReceiverInstance(dataTest(`Paper`), instance);

        return this;
    }

    assertSelectedInstances(assert) {
        instanceSelectionStep.assertSelectedInstances(assert);
        return this;
    }

    save() {
        this.cy
            .route({
                method: "PUT",
                url: "/api/dataStore/metadata-synchronization/rules",
            })
            .as("save");

        this.cy.contains("Save").click();

        return this;
    }

    assertSave() {
        this.cy.wait("@save").then(xhr => {
            assert.equal(xhr.response.body.httpStatusCode, 200);
        });

        return this;
    }
}
