import React from "react";
import i18n from "@dhis2/d2-i18n";
import { metadataModels } from "../../models/d2ModelFactory";
import GenericSynchronizationWizardPage from "./GenericSynchronizationWizardPage";
import commonStepsBaseInfo from "../wizard/common/CommonStepsBaseInfo";
import OrganisationUnitsSelectionStep from "../wizard/data/steps/CategoryOptionsSelectionStep";
import PeriodSelectionStep from "../wizard/data/steps/CategoryOptionsSelectionStep";
import CategoryOptionsSelectionStep from "../wizard/data/steps/CategoryOptionsSelectionStep";
import { D2 } from "../../types/d2";

interface DataPageProps {
    d2: D2;
}

const DataPage: React.FC<DataPageProps> = ({ d2 }) => {
    const stepsBaseInfo = [
        {
            key: "organisations-units",
            label: i18n.t("Organisation units"),
            component: OrganisationUnitsSelectionStep,
            validationKeys: ["organisationUnitIds"],
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

    return (
        <GenericSynchronizationWizardPage
            d2={d2}
            models={metadataModels}
            title={title}
            dialogStepsBaseInfo={stepsBaseInfo}
        />
    );
};

export default DataPage;
