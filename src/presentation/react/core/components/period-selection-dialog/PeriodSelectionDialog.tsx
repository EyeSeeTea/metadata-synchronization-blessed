import { Box, makeStyles, Theme } from "@material-ui/core";
import { ConfirmationDialog } from "d2-ui-components";
import React, { useState } from "react";
import i18n from "../../../../../locales";
import { PeriodFilter } from "../../../../webapp/msf-aggregate-data/pages/MSFHomePage";
import PeriodSelection from "../period-selection/PeriodSelection";

export interface PeriodSelectionDialogProps {
    title?: string;
    period: PeriodFilter;
    onClose(): void;
    onSave(value: PeriodFilter): void;
}

export const PeriodSelectionDialog: React.FC<PeriodSelectionDialogProps> = ({
    title,
    onClose,
    onSave,
    period,
}) => {
    const classes = useStyles();
    const [periodState, setPeriodState] = useState<PeriodFilter>(period);

    return (
        <ConfirmationDialog
            open={true}
            maxWidth="xs"
            fullWidth={true}
            title={title}
            onCancel={onClose}
            onSave={() => onSave(periodState)}
            cancelText={i18n.t("Cancel")}
            saveText={i18n.t("Save")}
        >
            <Box className={classes.periodContainer} width="80%">
                <PeriodSelection
                    className={classes.periodContent}
                    objectWithPeriod={periodState}
                    onChange={setPeriodState}
                />
            </Box>
        </ConfirmationDialog>
    );
};

const useStyles = makeStyles((theme: Theme) => ({
    periodContainer: {
        margin: "0 auto",
    },
    periodContent: {
        margin: theme.spacing(2),
    },
}));
