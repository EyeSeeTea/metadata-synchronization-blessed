import i18n from "@dhis2/d2-i18n";
import { DialogContent } from "@material-ui/core";
import { ConfirmationDialog, Wizard, WizardStep } from "d2-ui-components";
import _ from "lodash";
import React, { useState } from "react";
import Instance, { MetadataMapping, MetadataMappingDictionary } from "../../models/instance";
import { MetadataType } from "../../utils/d2";
import { MappingTableProps } from "../mapping-table/MappingTable";
import { modelSteps } from "./Steps";

export interface MappingWizardStep extends WizardStep {
    showOnSyncDialog?: boolean;
    props: MappingTableProps;
}

export interface MappingWizardConfig {
    mappingPath: string[];
    type: string;
    element: MetadataType;
}

export interface MappingWizardProps {
    instance: Instance;
    config: MappingWizardConfig;
    updateMapping: (mapping: MetadataMappingDictionary) => Promise<void>;
    onApplyGlobalMapping(type: string, id: string, mapping: MetadataMapping): Promise<void>;
    onCancel?(): void;
}

export const prepareSteps = (type: string | undefined, element: MetadataType) => {
    if (!type) return [];
    return modelSteps[type]?.filter(({ isVisible = _.noop }) => isVisible(type, element)) ?? [];
};

const MappingWizard: React.FC<MappingWizardProps> = ({
    instance,
    config,
    updateMapping,
    onApplyGlobalMapping,
    onCancel = _.noop,
}) => {
    const { mappingPath, type, element } = config;

    const { mappedId = "", mapping = {} }: MetadataMapping = _.get(
        instance.metadataMapping,
        mappingPath,
        {}
    );

    const filterRows = _(mapping)
        .mapValues(Object.keys)
        .values()
        .flatten()
        .value();

    const onChangeMapping = async (subMapping: MetadataMappingDictionary) => {
        const newMapping = _.clone(instance.metadataMapping);
        _.set(newMapping, [...mappingPath, "mapping"], subMapping);
        await updateMapping(newMapping);
    };

    const steps: MappingWizardStep[] =
        prepareSteps(type, element).map(({ models, isVisible, ...step }) => ({
            ...step,
            props: {
                models,
                globalMapping: instance.metadataMapping,
                mapping,
                onChangeMapping,
                onApplyGlobalMapping,
                instance,
                filterRows,
                mappingPath: [...mappingPath, mappedId],
                isChildrenMapping: true,
            },
        })) ?? [];

    const [stepName, updateStepName] = useState<string>(steps[0]?.label);

    const onStepChangeRequest = async (_prev: WizardStep, next: WizardStep) => {
        updateStepName(next.label);
        return undefined;
    };

    if (steps.length === 0) return null;

    const initialStepKey = steps.map(step => step.key)[0];
    const mainTitle = i18n.t(`Related metadata mapping for {{name}} ({{id}})`, element);
    const title = _.compact([mainTitle, stepName]).join(" - ");

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
                    onStepChangeRequest={onStepChangeRequest}
                    initialStepKey={initialStepKey}
                    lastClickableStepIndex={steps.length - 1}
                    steps={steps}
                />
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default MappingWizard;
