import i18n from "@dhis2/d2-i18n";
import { DialogContent } from "@material-ui/core";
import { ConfirmationDialog, Wizard } from "d2-ui-components";
import _ from "lodash";
import { title } from "process";
import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { MetadataMappingDictionary } from "../../models/instance";
import MappingTable from "../mapping-table/MappingTable";

interface MappingWizardStep {
    key: string;
    label: string;
    description?: string;
    warning?: string;
    help?: string;
    component: ReactNode;
    validationKeys: string[];
    showOnSyncDialog?: boolean;
}

interface MappingWizardProps {
    mapping: MetadataMappingDictionary;
    onChange?(mapping: MetadataMappingDictionary): void;
    onCancel?(): void;
}

const mappingSteps: MappingWizardStep[] = [
    {
        key: "category-options",
        label: i18n.t("Category Options"),
        component: MappingTable,
        validationKeys: [],
    },
    {
        key: "options",
        label: i18n.t("Options"),
        component: MappingTable,
        validationKeys: [],
        description: undefined,
        help: undefined,
        showOnSyncDialog: true,
    },
];

const MappingWizard: React.FC<MappingWizardProps> = ({
    mapping,
    onChange = _.noop,
    onCancel = _.noop,
}) => {
    const location = useLocation();

    const steps = mappingSteps.map(step => ({
        ...step,
        props: {
            mapping,
            onChange,
        },
    }));

    const urlHash = location.hash.slice(1);
    const stepExists = steps.find(step => step.key === urlHash);
    const firstStepKey = steps.map(step => step.key)[0];
    const initialStepKey = stepExists ? urlHash : firstStepKey;

    console.log("steps", steps);

    return (
        <ConfirmationDialog
            isOpen={true}
            title={title}
            onCancel={onCancel}
            cancelText={i18n.t("Close")}
            maxWidth={"lg"}
            fullWidth={true}
        >
            <DialogContent>
                <Wizard
                    useSnackFeedback={true}
                    onStepChangeRequest={_.noop}
                    initialStepKey={initialStepKey}
                    lastClickableStepIndex={steps.length - 1}
                    steps={steps}
                />
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default MappingWizard;
