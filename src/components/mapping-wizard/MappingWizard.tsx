import i18n from "@dhis2/d2-i18n";
import { DialogContent } from "@material-ui/core";
import { ConfirmationDialog, Wizard } from "d2-ui-components";
import _ from "lodash";
import { title } from "process";
import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Instance, { MetadataMappingDictionary } from "../../models/instance";
import MappingTable, { MappingTableProps } from "../mapping-table/MappingTable";
import { CategoryOptionModel, OptionModel } from "../../models/d2Model";

interface MappingWizardStep {
    key: string;
    label: string;
    description?: string;
    warning?: string;
    help?: string;
    props?: MappingTableProps;
    component: ReactNode;
    validationKeys: string[];
    showOnSyncDialog?: boolean;
}

interface MappingWizardProps {
    mapping: MetadataMappingDictionary;
    instance: Instance;
    updateInstance: (instance: Instance) => void;
    onChange?(mapping: MetadataMappingDictionary): void;
    onCancel?(): void;
}

const MappingWizard: React.FC<MappingWizardProps> = ({
    mapping,
    instance,
    onChange = _.noop,
    onCancel = _.noop,
    updateInstance = _.noop,
}) => {
    const location = useLocation();

    const steps: MappingWizardStep[] = [
        {
            key: "category-options",
            label: i18n.t("Category Options"),
            component: (props: MappingTableProps) => <MappingTable {...props} />,
            props: { models: [CategoryOptionModel], mapping, onChange, instance, updateInstance },
            validationKeys: [],
        },
        {
            key: "options",
            label: i18n.t("Options"),
            component: (props: MappingTableProps) => <MappingTable {...props} />,
            props: { models: [OptionModel], mapping, onChange, instance, updateInstance }, // TODO
            validationKeys: [],
            description: undefined,
            help: undefined,
        },
    ];

    const urlHash = location.hash.slice(1);
    const stepExists = steps.find(step => step.key === urlHash);
    const firstStepKey = steps.map(step => step.key)[0];
    const initialStepKey = stepExists ? urlHash : firstStepKey;

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
