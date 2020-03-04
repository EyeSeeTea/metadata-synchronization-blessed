import i18n from "@dhis2/d2-i18n";
import { DialogContent } from "@material-ui/core";
import { D2ModelSchemas } from "d2-api";
import { ConfirmationDialog, Wizard, WizardStep } from "d2-ui-components";
import _ from "lodash";
import React from "react";
import { useLocation } from "react-router-dom";
import Instance, { MetadataMapping, MetadataMappingDictionary } from "../../models/instance";
import { MetadataType } from "../../utils/d2";
import { modelSteps } from "./Steps";

export interface MappingWizardStep extends WizardStep {
    showOnSyncDialog?: boolean;
}

export interface MappingWizardConfig {
    mappingPath: string[];
    type: keyof D2ModelSchemas;
    element: MetadataType;
}

export interface MappingWizardProps {
    instance: Instance;
    config: MappingWizardConfig;
    updateMapping: (mapping: MetadataMappingDictionary) => void;
    onCancel?(): void;
}

const MappingWizard: React.FC<MappingWizardProps> = ({
    instance,
    config,
    updateMapping,
    onCancel = _.noop,
}) => {
    const location = useLocation();
    const { mappingPath, type, element } = config;

    const { mappedId, mapping = {} }: MetadataMapping = _.get(
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
        updateMapping(newMapping);
    };

    const onStepChangeRequest = async (_prev: WizardStep, _next: WizardStep) => {
        return undefined;
    };

    const steps: MappingWizardStep[] =
        modelSteps[type]?.map(step => ({
            ...step,
            props: {
                ...step.props,
                mapping,
                onChangeMapping,
                instance,
                filterRows,
                mappingPath: [...mappingPath, mappedId],
            },
        })) ?? [];

    const urlHash = location.hash.slice(1);
    const stepExists = steps.find(step => step.key === urlHash);
    const firstStepKey = steps.map(step => step.key)[0];
    const initialStepKey = stepExists ? urlHash : firstStepKey;
    const title = i18n.t("Related metadata mapping for {{name}} ({{id}})", element);

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
                {steps.length > 0 && (
                    <Wizard
                        useSnackFeedback={true}
                        onStepChangeRequest={onStepChangeRequest}
                        initialStepKey={initialStepKey}
                        lastClickableStepIndex={steps.length - 1}
                        steps={steps}
                    />
                )}
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default MappingWizard;
