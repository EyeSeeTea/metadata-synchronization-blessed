import { Checkbox, FormControlLabel, makeStyles, Theme } from "@material-ui/core";
import { ConfirmationDialog, useSnackbar } from "d2-ui-components";
import React, { useState } from "react";
import { Period } from "../../../../../domain/common/entities/Period";
import i18n from "../../../../../locales";
import PeriodSelection, {
    ObjectWithPeriod,
} from "../../../core/components/period-selection/PeriodSelection";
import { Toggle } from "../../../core/components/toggle/Toggle";

export type AdvancedSettings = {
    period?: Period;
    deleteDataValuesBeforeSync?: boolean;
    checkInPreviousPeriods?: boolean;
};

export interface AdvancedSettingsDialogProps {
    title?: string;
    advancedSettings?: AdvancedSettings;
    onClose(): void;
    onSave(advancedSettings?: AdvancedSettings): void;
}

export const AdvancedSettingsDialog: React.FC<AdvancedSettingsDialogProps> = ({
    title,
    onClose,
    onSave,
    advancedSettings,
}) => {
    const classes = useStyles();
    const snackbar = useSnackbar();
    const [deleteDataValuesBeforeSync, setDeleteDataValuesBeforeSync] = useState<boolean>(
        advancedSettings?.deleteDataValuesBeforeSync || false
    );

    const [checkInPreviousPeriods, setCheckInPreviousPeriods] = useState<boolean>(
        advancedSettings?.checkInPreviousPeriods || false
    );

    const [objectWithPeriod, setObjectWithPeriod] = useState<ObjectWithPeriod | undefined>(
        advancedSettings?.period
            ? {
                  period: advancedSettings?.period.type,
                  startDate: advancedSettings?.period.startDate,
                  endDate: advancedSettings?.period.endDate,
              }
            : undefined
    );

    const handleCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setObjectWithPeriod(undefined);
        } else {
            setObjectWithPeriod({ period: "ALL" });
        }
    };

    const handleSave = () => {
        if (objectWithPeriod) {
            const periodValidation = Period.create({
                type: objectWithPeriod.period,
                startDate: objectWithPeriod.startDate,
                endDate: objectWithPeriod.endDate,
            });

            periodValidation.match({
                error: errors => snackbar.error(errors.map(error => error.description).join("\n")),
                success: period =>
                    onSave({ period, deleteDataValuesBeforeSync, checkInPreviousPeriods }),
            });
        } else {
            onSave({ deleteDataValuesBeforeSync, checkInPreviousPeriods });
        }
    };

    return (
        <ConfirmationDialog
            open={true}
            maxWidth="xs"
            fullWidth={true}
            title={title}
            onCancel={onClose}
            onSave={() => handleSave()}
            cancelText={i18n.t("Cancel")}
            saveText={i18n.t("Save")}
        >
            <FormControlLabel
                control={
                    <Checkbox
                        checked={objectWithPeriod === undefined}
                        onChange={handleCheckBoxChange}
                    />
                }
                label={i18n.t("Use sync rules periods")}
            />

            {objectWithPeriod && (
                <div className={classes.period}>
                    <PeriodSelection
                        objectWithPeriod={objectWithPeriod}
                        onChange={setObjectWithPeriod}
                    />
                </div>
            )}

            <div>
                <Toggle
                    label={i18n.t("Delete data values before sync")}
                    onValueChange={setDeleteDataValuesBeforeSync}
                    value={deleteDataValuesBeforeSync}
                />
            </div>

            <div>
                <Toggle
                    label={i18n.t("Check existing data values in previous periods")}
                    onValueChange={setCheckInPreviousPeriods}
                    value={checkInPreviousPeriods}
                />
            </div>
        </ConfirmationDialog>
    );
};

const useStyles = makeStyles((theme: Theme) => ({
    period: {
        margin: theme.spacing(3, 0),
    },
}));
