import { makeStyles, Theme } from "@material-ui/core";
import { ConfirmationDialog } from "d2-ui-components";
import React, { useEffect, useMemo, useState } from "react";
import { DataElementGroup } from "../../../../../domain/metadata/entities/MetadataEntities";
import i18n from "../../../../../locales";
import { DataElementGroupModel } from "../../../../../models/dhis/metadata";
import Dropdown, { DropdownOption } from "../../../core/components/dropdown/Dropdown";
import { useAppContext } from "../../../core/contexts/AppContext";

export type RunAnalyticsSettings = boolean | "by-sync-rule-settings";

export type MSFSettings = {
    runAnalytics: RunAnalyticsSettings;
    dataElementGroupId?: string;
};

export interface MSFSettingsDialogProps {
    msfSettings: MSFSettings;
    onClose(): void;
    onSave(msfSettings: MSFSettings): void;
}

export const MSFSettingsDialog: React.FC<MSFSettingsDialogProps> = ({
    onClose,
    onSave,
    msfSettings,
}) => {
    const classes = useStyles();
    const { compositionRoot } = useAppContext();
    const [useSyncRule, setUseSyncRule] = useState(msfSettings.runAnalytics.toString());
    const [catOptionGroups, setDataElementGroups] = useState<DropdownOption<string>[]>([]);
    const [selectedDataElementGroup, setSelectedDataElementGroup] = useState(
        msfSettings.dataElementGroupId
    );

    useEffect(() => {
        compositionRoot.metadata
            .listAll({
                type: DataElementGroupModel.getCollectionName(),
                paging: false,
                order: {
                    field: "displayName" as const,
                    order: "asc" as const,
                },
            })
            .then(data => {
                const dataElementGroups = data as DataElementGroup[];

                setDataElementGroups(
                    dataElementGroups.map(group => ({ id: group.id, name: group.name }))
                );
            });
    }, [compositionRoot.metadata]);

    const useSyncRuleItems = useMemo(() => {
        return [
            {
                id: "true",
                name: i18n.t("True"),
            },
            {
                id: "false",
                name: i18n.t("False"),
            },
            {
                id: "by-sync-rule-settings",
                name: i18n.t("Use sync rule settings"),
            },
        ];
    }, []);

    const handleSave = () => {
        const msfSettings: MSFSettings = {
            runAnalytics:
                useSyncRule === "by-sync-rule-settings"
                    ? "by-sync-rule-settings"
                    : useSyncRule === "true"
                    ? true
                    : false,
            dataElementGroupId: selectedDataElementGroup,
        };

        onSave(msfSettings);
    };

    return (
        <ConfirmationDialog
            open={true}
            maxWidth="sm"
            fullWidth={true}
            title={i18n.t("MSF Settings")}
            onCancel={onClose}
            onSave={() => handleSave()}
            cancelText={i18n.t("Cancel")}
            saveText={i18n.t("Save")}
        >
            <div className={classes.selector}>
                <Dropdown
                    label={i18n.t("Run Analytics")}
                    items={useSyncRuleItems}
                    onValueChange={setUseSyncRule}
                    value={useSyncRule}
                    hideEmpty
                />
            </div>
            <div className={classes.selector}>
                <Dropdown
                    label={i18n.t("Data Element Group *")}
                    items={catOptionGroups}
                    onValueChange={setSelectedDataElementGroup}
                    value={selectedDataElementGroup || ""}
                    hideEmpty
                />
            </div>
            <div className={classes.info}>
                {i18n.t(
                    "* Data Element Group: used to check existing data values in the destination data elements",
                    { nsSeparator: false }
                )}
            </div>
        </ConfirmationDialog>
    );
};

const useStyles = makeStyles((theme: Theme) => ({
    selector: {
        margin: theme.spacing(3, 0, 3, 0),
    },
    info: {
        margin: theme.spacing(0, 0, 0, 1),
        fontSize: "0.8em",
    },
}));
