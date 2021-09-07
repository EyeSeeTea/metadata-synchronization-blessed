import { Checkbox, FormControlLabel, makeStyles } from "@material-ui/core";
import { ConfirmationDialog, DatePicker, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Moment } from "moment";
import React, { useState } from "react";
import { Period } from "../../../../../domain/common/entities/Period";
import i18n from "../../../../../locales";
import { AdvancedSettings } from "../../../../webapp/msf-aggregate-data/pages/MSFEntities";
import { ObjectWithPeriod } from "../../../core/components/period-selection/PeriodSelection";

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
    advancedSettings = {},
}) => {
    const classes = useStyles();
    const snackbar = useSnackbar();

    const [objectWithPeriod, setObjectWithPeriod] = useState<ObjectWithPeriod | undefined>(advancedSettings.period);

    const handleCheckBoxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setObjectWithPeriod(event.target.checked ? undefined : { period: "FIXED" });
    };

    const updateStartDate = (startDate: Moment) => {
        setObjectWithPeriod(period => ({
            period: "FIXED",
            startDate: startDate.toDate(),
            endDate: period?.endDate,
        }));
    };

    const updateEndDate = (endDate: Moment) => {
        setObjectWithPeriod(period => ({
            period: "FIXED",
            startDate: period?.startDate,
            endDate: endDate.toDate(),
        }));
    };

    const handleSave = () => {
        if (!objectWithPeriod) {
            onSave({ period: undefined });
            return;
        }

        const periodValidation = Period.create({
            type: objectWithPeriod.period,
            startDate: objectWithPeriod.startDate,
            endDate: objectWithPeriod.endDate,
        });

        periodValidation.match({
            error: errors => snackbar.error(errors.map(error => error.description).join("\n")),
            success: period => onSave({ period: period.toObject() }),
        });
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
                control={<Checkbox checked={objectWithPeriod === undefined} onChange={handleCheckBoxChange} />}
                label={i18n.t("Use sync rules periods")}
            />

            {objectWithPeriod && (
                <div className={classes.fixedPeriod}>
                    <div className={classes.datePicker}>
                        <DatePicker
                            label={i18n.t("Start date")}
                            value={objectWithPeriod.startDate || null}
                            onChange={updateStartDate}
                        />
                    </div>
                    <div className={classes.datePicker}>
                        <DatePicker
                            label={i18n.t("End date")}
                            value={objectWithPeriod.endDate || null}
                            onChange={updateEndDate}
                        />
                    </div>
                </div>
            )}
        </ConfirmationDialog>
    );
};

const useStyles = makeStyles(() => ({
    fixedPeriod: {
        marginTop: 5,
        marginBottom: 20,
        marginLeft: 10,
    },
    datePicker: {
        marginTop: -10,
    },
}));
