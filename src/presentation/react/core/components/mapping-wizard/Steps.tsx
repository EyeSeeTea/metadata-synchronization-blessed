import i18n from "../../../../../locales";
import { D2Model } from "../../../../../models/dhis/default";
import {
    CategoryOptionComboMappedModel,
    CategoryOptionMappedModel,
    OptionMappedModel,
    ProgramStageMappedModel,
} from "../../../../../models/dhis/mapping";
import { Dictionary } from "../../../../../types/utils";
import { MetadataType } from "../../../../../utils/d2";
import MappingTable, { MappingTableProps } from "../mapping-table/MappingTable";
import { MappingWizardStep } from "./MappingWizard";

type MappingWizardStepBuilder = Omit<MappingWizardStep, "props"> & {
    models: typeof D2Model[];
    isVisible?: (type: string, element: MetadataType) => boolean;
};

export const buildModelSteps = (type: string): MappingWizardStepBuilder[] => {
    const availableSteps: { [key: string]: MappingWizardStepBuilder } = {
        categoryOptions: {
            key: "category-options",
            label: i18n.t("Category Options"),
            component: (props: MappingTableProps) => <MappingTable {...props} />,
            models: [CategoryOptionMappedModel],
            isVisible: (_type: string, element: MetadataType) => {
                return !!element.categoryCombo?.id;
            },
        },
        categoryOptionCombos: {
            key: "category-option-combos",
            label: i18n.t("Category Option Combos"),
            component: (props: MappingTableProps) => <MappingTable {...props} />,
            models: [CategoryOptionComboMappedModel],
            isVisible: (_type: string, element: MetadataType) => {
                return !!element.aggregateExportCategoryOptionCombo;
            },
        },
        options: {
            key: "options",
            label: i18n.t("Options"),
            component: (props: MappingTableProps) => <MappingTable {...props} />,
            models: [OptionMappedModel],
            isVisible: (_type: string, element: MetadataType) => {
                return !!element.optionSet?.id;
            },
        },
        programStages: {
            key: "programStages",
            label: i18n.t("Program Stages"),
            component: (props: MappingTableProps) => <MappingTable {...props} />,
            models: [ProgramStageMappedModel],
            isVisible: (type: string, element: MetadataType) => {
                return type === "programs" && element.programType === "WITH_REGISTRATION";
            },
        },
    };

    const modelSteps: Dictionary<MappingWizardStepBuilder[]> = {
        aggregatedDataElements: [
            availableSteps.categoryOptions,
            availableSteps.categoryOptionCombos,
            availableSteps.options,
        ],
        programDataElements: [availableSteps.options],
        eventPrograms: [availableSteps.categoryOptions, availableSteps.programStages],
        trackerPrograms: [availableSteps.categoryOptions],
        trackedEntityAttributesToTEI: [availableSteps.options],
        trackedEntityAttributesToDE: [availableSteps.options],
    };

    return modelSteps[type] ?? [];
};
