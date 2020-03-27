import PageObject from "./PageObject";

export default class InstancePageObject extends PageObject {
    constructor(cy, key) {
        super(cy);
        this.key = key;
    }

    open() {
        super.open("/#/instances/");
    }

    findInstance(instance) {
        return this.cy.get("tbody").contains(instance);
    }

    openInstance(instance) {
        return this.findInstance(instance)
            .parent()
            .find("button")
            .click();
    }
}
