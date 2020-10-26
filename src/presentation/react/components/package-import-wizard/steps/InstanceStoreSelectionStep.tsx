import React from "react";
import { PackageSource } from "../../../../../domain/package-import/entities/PackageSource";
import i18n from "../../../../../locales";
import {
    InstanceSelectionDropdown,
    InstanceSelectionOption,
} from "../../instance-selection-dropdown/InstanceSelectionDropdown";
import { PackageImportWizardProps } from "../PackageImportWizard";

const showInstances = { local: false, remote: true, store: true };

export const InstanceStoreSelectionStep: React.FC<PackageImportWizardProps> = ({
    packageImportRule,
    onChange,
}) => {
    const handleSelectionChange = (_type: InstanceSelectionOption, source?: PackageSource) => {
        if (source) onChange(packageImportRule.updateSource(source));
    };

    return (
        <InstanceSelectionDropdown
            title={i18n.t("Instances & Play Stores")}
            showInstances={showInstances}
            selectedInstance={packageImportRule.source.id}
            onChangeSelected={handleSelectionChange}
        />
    );
};
