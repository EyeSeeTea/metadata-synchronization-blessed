import { dataTest } from "../../utils";

export default class PageObject {
    constructor(cy) {
        this.cy = cy;
    }

    assertTitle(assert) {
        assert(this.cy.get(dataTest("page-header-title")));
        return this;
    }

    assertError(assert) {
        assert(this.cy.get("#client-snackbar"));
        return this;
    }

    open(url) {
        this.cy.login("admin");
        this.cy.visit(url);
        this.cy.get(dataTest("headerbar-title")).contains("MetaData Synchronization");
    }
}
