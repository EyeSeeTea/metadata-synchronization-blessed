import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import { makeStyles, TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import React, { useMemo, useState, useEffect, useCallback } from "react";
import i18n from "../../../../../utils/i18n";
import { Dropdown, DropdownOption } from "../dropdown/Dropdown";
import { PackageItem } from "../package-list-table/PackageModuleItem";
import { useGetSupportedVersions } from "../../hooks/useGetSupportedVersions";

export interface PackagesExtendCompatibilityDialogProps {
    onClose(): void;
    onSave(packakeId: string, dhis2Versions: string[]): void;
    packages: PackageItem[];
}

export const PackagesExtendCompatibilityDialog: React.FC<PackagesExtendCompatibilityDialogProps> = ({
    onSave,
    onClose,
    packages,
}) => {
    const classes = useStyles();
    const { supportedVersions } = useGetSupportedVersions();

    const [existedDhis2Versions, SetExistedDhis2Versions] = useState<DropdownOption[]>([]);
    const [selectedExistedDhis2Version, setSelectedExistedDhis2Version] = useState<string>("");

    const [newDhis2Versions, SetNewDhis2Versions] = useState<string[]>([]);
    const [selectedNewDhis2Versions, setSelectedNewDhis2Versions] = useState<string[]>([]);

    useEffect(() => {
        const dhis2VersionsInPackages = packages.map(pkg => pkg.dhisVersion);
        SetNewDhis2Versions(supportedVersions.filter(d2version => !dhis2VersionsInPackages.includes(d2version)));
        SetExistedDhis2Versions(
            dhis2VersionsInPackages.map(dhis2Version => ({ id: dhis2Version, name: dhis2Version }))
        );
    }, [packages, supportedVersions]);

    const title = useMemo(() => {
        const firstPackage = packages[0];

        return {
            module: firstPackage.module.name,
            version: firstPackage.version,
        };
    }, [packages]);

    const handleSave = useCallback(() => {
        if (!onSave) return;

        const selectedPkg = packages.find(pkg => pkg.dhisVersion === selectedExistedDhis2Version);

        if (!selectedPkg) return;

        onSave(selectedPkg.id, selectedNewDhis2Versions);
    }, [onSave, selectedExistedDhis2Version, selectedNewDhis2Versions, packages]);

    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={true}
                title={i18n.t(
                    "Extend DHIS2 version compatibility for module {{module}} and version {{version}}",
                    title
                )}
                maxWidth="sm"
                fullWidth={true}
                onCancel={onClose}
                onSave={handleSave}
                disableSave={!selectedNewDhis2Versions || selectedNewDhis2Versions.length === 0}
                cancelText={i18n.t("Cancel")}
                saveText={i18n.t("Create package(s)")}
            >
                <Dropdown
                    label={i18n.t("Copy From (*)")}
                    items={existedDhis2Versions}
                    onValueChange={setSelectedExistedDhis2Version}
                    value={selectedExistedDhis2Version}
                />

                <Autocomplete
                    className={classes.row}
                    multiple
                    options={newDhis2Versions}
                    value={selectedNewDhis2Versions}
                    onChange={(_event, value) => setSelectedNewDhis2Versions(value)}
                    renderTags={(values: string[]) => values.sort().join(", ")}
                    renderInput={params => (
                        <TextField
                            {...params}
                            variant="standard"
                            label={i18n.t("New DHIS2 version compatibility (*)")}
                        />
                    )}
                />
            </ConfirmationDialog>
        </React.Fragment>
    );
};

const useStyles = makeStyles({
    row: {
        marginTop: 10,
        marginLeft: 10,
    },
});
