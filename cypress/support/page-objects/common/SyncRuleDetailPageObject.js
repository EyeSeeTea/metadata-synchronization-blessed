import { dataTest } from "../../utils";
import PageObject from "./PageObject";

export default class SyncRuleDetailPageObject extends PageObject {
    constructor(cy, key) {
        super(cy);
        this.key = key;
    }

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

    next() {
        this.cy.get('[data-test="Button-next-→"]').click();
        return this;
    }

    selectReceiverInstance(instance) {
        this.cy.selectInMultiSelector(
            dataTest(`DialogContent-${this.key}-synchronization`),
            instance
        );
        return this;
    }
}
