import PageObject from "./PageObject";

export default class MappingInstancePageObject extends PageObject {
    constructor(cy, key) {
        super(cy);
        this.key = key;
    }

    open(instance) {
        super.open("/#/instances/mapping/" + instance + "/" + this.key);
    }

    openRowMenu() {
        this.cy.get(".MuiTableBody-root > :nth-child(1) > .MuiTableCell-alignCenter > .MuiButtonBase-root").click();
        return this;
    }

    openSelectedRowMenu() {
        this.cy.get(".Mui-selected").rightclick();
        return this;
    }

    openGeneralMenu() {
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

    clickOption(option) {
        this.cy.get(".MuiList-root").contains(option).click();
        return this;
    }

    checkCheckboxByText(text) {
        this.cy.checkRowCheckboxByText(text);
        return this;
    }

    assertDialog(assert) {
        assert(this.cy.get("div > .MuiDialogContent-root"));
        return this;
    }

    clickOkOnDialog() {
        this.cy.get(".MuiDialogActions-root").contains("Ok").click();
    }

    closeDialog() {
        this.cy.get(".MuiDialogActions-root").contains("Close").parent().find("Button").click();
        return this;
    }

    assertRowStatus(assert, row) {
        assert(cy.get("table").contains(row).parent());
        return this;
    }

    assertMappedObjectTitle(assert) {
        assert(cy.get(".MuiDialogTitle-root > .MuiTypography-root"));
        return this;
    }

    selectMappingObject(object) {
        this.cy.get(".MuiDialogContent-root >").contains(object).parent().find("input").click();
        return this;
    }
}
