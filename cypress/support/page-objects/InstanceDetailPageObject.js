import InstancePageObject from "./common/InstancePageObject";
import { dataTest } from "../utils";

class InstanceDetailPageObject extends InstancePageObject {
    newInstance() {
        this.cy.get(dataTest("objects-table-action-button")).click();

        return this;
    }

    save() {
        this.cy.get(dataTest("save-button")).click();
        return this;
    }

    assertInputError(input) {
        this.cy
            .get(dataTest(input))
            .parent()
            .contains("Field cannot be blank");
        return this;
    }

    assertInvalidUrlError() {
        this.cy
            .get(dataTest("url"))
            .parent()
            .contains("Field should be an url");
        return this;
    }

    testConnection() {
        this.cy.get(dataTest("test-connection-button")).click();
        return this;
    }

    typeName(name) {
        this.cy
            .get(dataTest("name"))
            .parent()
            .type(name);
        return this;
    }

    typeCreedentials(user, pass) {
        this.cy
            .get(dataTest("username"))
            .parent()
            .type(user);
        this.cy
            .get(dataTest("password"))
            .parent()
            .type(pass);
        return this;
    }

    typeUrl(value) {
        this.cy
            .get(dataTest("url"))
            .parent()
            .type(value);
        return this;
    }

    unfocus() {
        this.cy.get(dataTest("test-connection-button")).focus();
        return this;
    }
}

export default InstanceDetailPageObject;
