import React from "react";
import i18n from "@dhis2/d2-i18n";
import { metadataModels } from "../../models/d2Model";
import GenericSynchronizationWizardPage from "./GenericSynchronizationWizardPage";
import commonStepsBaseInfo from "../wizard/common/CommonStepsBaseInfo";
import OrganisationUnitsSelectionStep from "../wizard/data/steps/OrganisationUnitsSelectionStep";
import PeriodSelectionStep from "../wizard/data/steps/CategoryOptionsSelectionStep";
import CategoryOptionsSelectionStep from "../wizard/data/steps/CategoryOptionsSelectionStep";
import { D2 } from "../../types/d2";
import { SyncRuleType } from "../../types/synchronization";

interface DataPageProps {
    d2: D2;
}

const DataPage: React.FC<DataPageProps> = ({ d2 }) => {
    const stepsBaseInfo = [
        {
            key: "organisations-units",
            label: i18n.t("Organisation units"),
            component: OrganisationUnitsSelectionStep,
            validationKeys: ["organisationUnits"],
            description: undefined,
            help: undefined,
        },
        {
            key: "period",
            label: i18n.t("Period"),
            component: PeriodSelectionStep,
            validationKeys: ["period"],
            description: undefined,
            help: undefined,
        },
        {
            key: "category-options",
            label: i18n.t("Category options"),
            component: CategoryOptionsSelectionStep,
            validationKeys: ["categoryOptionIds"],
            description: undefined,
            help: undefined,
        },
        commonStepsBaseInfo.instanceSelection,
    ];

    const title = i18n.t("Data Synchronization");

    const type: SyncRuleType = "data";

    return (
        <GenericSynchronizationWizardPage
            d2={d2}
            models={metadataModels}
            title={title}
            dialogStepsBaseInfo={stepsBaseInfo}
            type={type}
        />
    );
};

export default DataPage;
