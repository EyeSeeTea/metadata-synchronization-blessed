import InstancePageObject from "./common/InstancePageObject";
import { dataTest } from "../utils";

const routeName = "instanceMapping";

class InstanceMappingPageObject extends InstancePageObject {
    open(instance) {
        super.open();

        this.activeRouteToWait();
        super.openInstance(instance);
        this.cy.get(dataTest("Typography-mapping")).click();

        cy.wait(`@${routeName}`);
        return this;
    }

    findOption(option) {
        return this.cy.get("tbody").contains(option);
    }

    activeRouteToWait() {
        this.cy
            .route({
                method: "GET",
                url: "/api/dataStore/metadata-synchronization/instances*",
            })
            .as(routeName);
        return this;
    }

    openSection(option) {
        this.cy
            .get(dataTest("CardActions-landing-mapping-" + option))
            .find("button")
            .click();
        return this;
    }

    assertMappingTitle(assert) {
        assert(this.cy.get(dataTest("div-instance-mapping-destination-this-8080")));
        return this;
    }

    assertOption(assert) {
        assert(this.cy.get(dataTest("div-instance-mapping-destination-this-8080-landing")));
        return this;
    }
}

export default InstanceMappingPageObject;
