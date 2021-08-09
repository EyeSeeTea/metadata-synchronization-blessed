import { Box, Icon, IconButton } from "@material-ui/core";
import React, { useState } from "react";
import { PackageSource } from "../../../../../../domain/package-import/entities/PackageSource";
import { Store } from "../../../../../../domain/stores/entities/Store";
import i18n from "../../../../../../locales";
import {
    InstanceSelectionDropdown,
    InstanceSelectionOption,
} from "../../instance-selection-dropdown/InstanceSelectionDropdown";
import StoreCreationDialog from "../../store-creation/StoreCreationDialog";
import { PackageImportWizardProps } from "../PackageImportWizard";

const showInstances = { remote: true, store: true };

export const InstanceStoreSelectionStep: React.FC<PackageImportWizardProps> = ({ packageImportRule, onChange }) => {
    const [creationDialogOpen, setCreationDialogOpen] = useState<boolean>(false);
    const [refreshKey, setRefreshKey] = useState(Math.random);

    const handleSelectionChange = (_type: InstanceSelectionOption, source?: PackageSource) => {
        if (source) onChange(packageImportRule.updateSource(source));
    };

    const handleOnSaved = (store: Store) => {
        setCreationDialogOpen(false);
        onChange(packageImportRule.updateSource(store));
        setRefreshKey(Math.random);
    };

    return (
        <React.Fragment>
            <Box display="flex" flexDirection="row">
                <InstanceSelectionDropdown
                    title={i18n.t("Instances & Play Stores")}
                    showInstances={showInstances}
                    selectedInstance={packageImportRule.source.id}
                    onChangeSelected={handleSelectionChange}
                    refreshKey={refreshKey}
                />
                <IconButton onClick={() => setCreationDialogOpen(true)}>
                    <Icon>add_circle_outline</Icon>
                </IconButton>
            </Box>

            <StoreCreationDialog
                isOpen={creationDialogOpen}
                onClose={() => setCreationDialogOpen(false)}
                onSaved={handleOnSaved}
            />
        </React.Fragment>
    );
};
