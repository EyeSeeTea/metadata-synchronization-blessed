import { makeStyles } from "@material-ui/core";
import DialogContent from "@material-ui/core/DialogContent";
import { ConfirmationDialog, Sharing, SharingProps } from "@eyeseetea/d2-ui-components";
import React from "react";
import i18n from "../../../../../locales";

export interface SharingDialogProps extends SharingProps {
    isOpen: boolean;
    onCancel: () => void;
    title?: string;
}

export const SharingDialog: React.FC<SharingDialogProps> = ({
    isOpen,
    onCancel,
    title = i18n.t("Sharing settings"),
    ...rest
}) => {
    const classes = useStyles();

    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={isOpen}
                title={title}
                onCancel={onCancel}
                cancelText={i18n.t("Close")}
                maxWidth={"lg"}
                fullWidth={true}
                disableEnforceFocus
            >
                <DialogContent className={classes.content}>
                    <Sharing {...rest} />
                </DialogContent>
            </ConfirmationDialog>
        </React.Fragment>
    );
};

const useStyles = makeStyles({
    content: {
        paddingTop: 0,
    },
});
