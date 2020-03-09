import i18n from "@dhis2/d2-i18n";
import React from "react";
import { CategoryOptionModel, D2Model, OptionModel, ProgramStageModel } from "../../models/d2Model";
import { MetadataType } from "../../utils/d2";
import MappingTable, { MappingTableProps } from "../mapping-table/MappingTable";
import { MappingWizardStep } from "./MappingWizard";

const availableSteps: { [key: string]: MappingWizardStepBuilder } = {
    categoryOptions: {
        key: "category-options",
        label: i18n.t("Category Options"),
        component: (props: MappingTableProps) => <MappingTable {...props} />,
        models: [CategoryOptionModel],
        isVisible: (_type: string, element: MetadataType) => {
            return !!element.categoryCombo?.id;
        },
    },
    options: {
        key: "options",
        label: i18n.t("Options"),
        component: (props: MappingTableProps) => <MappingTable {...props} />,
        models: [OptionModel],
        isVisible: (_type: string, element: MetadataType) => {
            return !!element.optionSet?.id;
        },
    },
    programStages: {
        key: "programStages",
        label: i18n.t("Program Stages"),
        component: (props: MappingTableProps) => <MappingTable {...props} />,
        models: [ProgramStageModel],
        isVisible: (type: string, element: MetadataType) => {
            return type === "programs" && element.programType === "WITH_REGISTRATION";
        },
    },
};

type MappingWizardStepBuilder = Omit<MappingWizardStep, "props"> & {
    models: typeof D2Model[];
    isVisible?: (type: string, element: MetadataType) => boolean;
};

export const modelSteps: { [key: string]: MappingWizardStepBuilder[] } = {
    aggregatedDataElements: [availableSteps.categoryOptions, availableSteps.options],
    programDataElements: [availableSteps.options],
    programs: [availableSteps.categoryOptions, availableSteps.programStages],
};
