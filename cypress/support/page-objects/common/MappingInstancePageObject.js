import PageObject from "./PageObject";

export default class MappingInstancePageObject extends PageObject {
    constructor(cy, key) {
        super(cy);
        this.key = key;
    }

    open(instance) {
        super.open("/#/instances/mapping/" + instance + "/" + this.key);
    }

    openRowActions() {
        this.cy
            .get(
                ".MuiTableBody-root > :nth-child(1) > .MuiTableCell-alignCenter > .MuiButtonBase-root"
            )
            .click();
        return this;
    }

    openBulkActions() {
        this.cy
            .get(
                ".MuiTableHead-root > .MuiTableRow-root > .MuiTableCell-alignCenter > .MuiButtonBase-root > .MuiIconButton-label > .MuiSvgIcon-root"
            )
            .click();
        return this;
    }

    assertOption(assert) {
        assert(this.cy.get(".MuiList-root"));
        return this;
    }
}
