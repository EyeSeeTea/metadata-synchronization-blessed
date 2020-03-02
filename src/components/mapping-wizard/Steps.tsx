import i18n from "@dhis2/d2-i18n";
import React from "react";
import { CategoryOptionModel, OptionModel, ProgramStageModel } from "../../models/d2Model";
import MappingTable, { MappingTableProps } from "../mapping-table/MappingTable";
import { MappingWizardStep } from "./MappingWizard";

const availableSteps = {
    categoryOptions: {
        key: "category-options",
        label: i18n.t("Category Options"),
        component: (props: MappingTableProps) => <MappingTable {...props} />,
        props: {
            models: [CategoryOptionModel],
            isChildrenMapping: true,
        },
    },
    options: {
        key: "options",
        label: i18n.t("Options"),
        component: (props: MappingTableProps) => <MappingTable {...props} />,
        props: {
            models: [OptionModel],
            isChildrenMapping: true,
        },
    },
    programStages: {
        key: "programStages",
        label: i18n.t("Program Stages"),
        component: (props: MappingTableProps) => <MappingTable {...props} />,
        props: {
            models: [ProgramStageModel],
            isChildrenMapping: true,
        },
    },
};

export const modelSteps: { [key: string]: MappingWizardStep[] } = {
    dataElements: [availableSteps.categoryOptions, availableSteps.options],
    programDataElements: [availableSteps.options],
    programs: [availableSteps.categoryOptions, availableSteps.programStages],
};
