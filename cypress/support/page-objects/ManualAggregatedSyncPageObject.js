import { dataTest } from "../utils";
import ManualSyncPageObject from "./common/ManualSyncPageObject";
import * as orgUnitStep from "../page-utils/orgUnitStep";
import * as periodStep from "../page-utils/periodStep";
import * as categoryOptionsStep from "../page-utils/categoryOptionsStep";

class ManualAggregatedSyncPageObject extends ManualSyncPageObject {
    constructor(cy) {
        super(cy, "aggregated-data");
    }

    open() {
        super.open("/#/sync/aggregated");
        return this;
    }

    selectAllAttributesCategoryOptions() {
        categoryOptionsStep.selectAllAttributesCategoryOptions();
        return this;
    }

    selectOrgUnit(orgUnit) {
        orgUnitStep.selectOrgUnit(dataTest(`DialogContent-${this.key}-synchronization`), orgUnit);
        return this;
    }

    selectAllPeriods() {
        periodStep.selectAllPeriods();
        return this;
    }

    synchronize() {
        this.cy
            .route({
                method: "POST",
                url: "/api/dataValueSets*",
            })
            .as("postDataValueSets");

        this.syncButton.click();
        this.cy.wait("@postDataValueSets");
        return this;
    }
}

export default ManualAggregatedSyncPageObject;
