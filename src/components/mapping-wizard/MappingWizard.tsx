import i18n from "@dhis2/d2-i18n";
import { DialogContent } from "@material-ui/core";
import { ConfirmationDialog, Wizard } from "d2-ui-components";
import _ from "lodash";
import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { CategoryOptionModel, OptionModel } from "../../models/d2Model";
import Instance, { MetadataMapping, MetadataMappingDictionary } from "../../models/instance";
import MappingTable, { MappingTableProps } from "../mapping-table/MappingTable";

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
    instance: Instance;
    mappingPath: string[];
    updateMapping: (mapping: MetadataMappingDictionary) => void;
    onCancel?(): void;
}

const availableSteps = [
    {
        key: "category-options",
        label: i18n.t("Category Options"),
        component: (props: MappingTableProps) => <MappingTable {...props} />,
        props: {
            models: [CategoryOptionModel],
            isChildrenMapping: true,
        },
        validationKeys: [],
    },
    {
        key: "options",
        label: i18n.t("Options"),
        component: (props: MappingTableProps) => <MappingTable {...props} />,
        props: {
            models: [OptionModel],
            isChildrenMapping: true,
        },
        validationKeys: [],
        description: undefined,
        help: undefined,
    },
];

const MappingWizard: React.FC<MappingWizardProps> = ({
    instance,
    mappingPath,
    updateMapping,
    onCancel = _.noop,
}) => {
    const location = useLocation();

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

    const steps: MappingWizardStep[] = availableSteps.map(step => ({
        ...step,
        props: {
            ...step.props,
            mapping,
            onChangeMapping,
            instance,
            filterRows,
            mappingPath: [...mappingPath, mappedId],
        },
    }));

    const urlHash = location.hash.slice(1);
    const stepExists = steps.find(step => step.key === urlHash);
    const firstStepKey = steps.map(step => step.key)[0];
    const initialStepKey = stepExists ? urlHash : firstStepKey;

    return (
        <ConfirmationDialog
            isOpen={true}
            title={i18n.t("Related metadata mapping")}
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
