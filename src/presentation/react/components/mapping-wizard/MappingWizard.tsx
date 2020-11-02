import { DialogContent } from "@material-ui/core";
import { ConfirmationDialog, Wizard, WizardStep } from "d2-ui-components";
import _ from "lodash";
import React, { useState } from "react";
import { DataSource } from "../../../../domain/instance/entities/DataSource";
import {
    MetadataMapping,
    MetadataMappingDictionary,
} from "../../../../domain/mapping/entities/MetadataMapping";
import i18n from "../../../../locales";
import { MetadataType } from "../../../../utils/d2";
import { MappingTableProps } from "../mapping-table/MappingTable";
import { cleanNestedMappedId } from "../mapping-table/utils";
import { buildModelSteps } from "./Steps";

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
    originInstance?: DataSource;
    destinationInstance: DataSource;
    mapping: MetadataMappingDictionary;
    config: MappingWizardConfig;
    onUpdateMapping: (mapping: MetadataMappingDictionary) => Promise<void>;
    onApplyGlobalMapping(type: string, id: string, mapping: MetadataMapping): Promise<void>;
    onCancel?(): void;
}

export const prepareSteps = (type: string | undefined, element: MetadataType) => {
    if (!type) return [];
    return buildModelSteps(type).filter(({ isVisible = _.noop }) => isVisible(type, element));
};

const MappingWizard: React.FC<MappingWizardProps> = ({
    originInstance,
    destinationInstance,
    mapping: instanceMapping,
    config,
    onUpdateMapping,
    onApplyGlobalMapping,
    onCancel = _.noop,
}) => {
    const { mappingPath, type, element } = config;

    const { mappedId = "", mapping = {} }: MetadataMapping = _.get(
        instanceMapping,
        mappingPath,
        {}
    );

    const mappingKeys = _(mapping).mapValues(Object.keys).values().flatten().value();

    const filterRows = mappingKeys.map(cleanNestedMappedId);

    const transformRows = (rows: MetadataType[]) => {
        return rows.filter(({ id }) => mappingKeys.includes(id));
    };

    const onChangeMapping = async (subMapping: MetadataMappingDictionary) => {
        const newMapping = _.clone(instanceMapping);
        _.set(newMapping, [...mappingPath, "mapping"], subMapping);
        await onUpdateMapping(newMapping);
    };

    const steps: MappingWizardStep[] =
        prepareSteps(type, element).map(({ models, ...step }) => ({
            ...step,
            props: {
                models,
                globalMapping: instanceMapping,
                mapping,
                onChangeMapping,
                onApplyGlobalMapping,
                originInstance,
                destinationInstance,
                filterRows,
                transformRows,
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
