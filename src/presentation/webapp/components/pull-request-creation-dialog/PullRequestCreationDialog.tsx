import { makeStyles, TextField } from "@material-ui/core";
import { ConfirmationDialog, useSnackbar, useLoading } from "d2-ui-components";
import React, { useCallback, useState } from "react";
import { Instance } from "../../../../domain/instance/entities/Instance";
import { SyncRuleType } from "../../../../domain/synchronization/entities/SynchronizationRule";
import i18n from "../../../../locales";
import { SynchronizationBuilder } from "../../../../types/synchronization";
import { useAppContext } from "../../../common/contexts/AppContext";
import { PullRequestType } from "../../../../domain/synchronization/entities/PullRequest";

export interface PullRequestCreation {
    instance: Instance;
    builder: SynchronizationBuilder;
    type: SyncRuleType;
}

export interface PullRequestCreationDialogProps extends PullRequestCreation {
    onClose: () => void;
}

interface PullRequestFields {
    subject?: string;
    description?: string;
}

export const PullRequestCreationDialog: React.FC<PullRequestCreationDialogProps> = ({
    instance,
    type,
    builder,
    onClose,
}) => {
    const { compositionRoot } = useAppContext();
    const classes = useStyles();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const [fields, updateFields] = useState<PullRequestFields>({});

    const save = useCallback(async () => {
        const { subject, description } = fields;
        if (!subject) {
            snackbar.error(i18n.t("You need to provide a subject"));
            return;
        }

        loading.show(true, i18n.t("Creating pull request"));
        const sync = compositionRoot.sync[type](builder);
        const payload = await sync.buildPayload();

        await compositionRoot.sync.createPullRequest({
            instance,
            type: type as PullRequestType,
            ids: builder.metadataIds,
            payload,
            subject,
            description,
        });

        onClose();
        loading.reset();
    }, [compositionRoot, builder, fields, type, instance, onClose, snackbar, loading]);

    const updateTextField = useCallback(
        (field: keyof PullRequestFields) => (event: React.ChangeEvent<{ value: unknown }>) => {
            const value = event.target.value as string;
            updateFields(fields => ({ ...fields, [field]: value }));
        },
        []
    );

    return (
        <ConfirmationDialog
            isOpen={true}
            title={i18n.t("Create pull request on {{name}}", instance)}
            maxWidth={"sm"}
            fullWidth={true}
            onCancel={onClose}
            onSave={save}
            saveText={i18n.t("Open pull request")}
        >
            <TextField
                className={classes.row}
                fullWidth={true}
                label={i18n.t("Subject")}
                value={fields.subject ?? ""}
                onChange={updateTextField("subject")}
                error={fields.subject === ""}
                helperText={fields.subject === "" ? i18n.t("Field cannot be blank") : undefined}
            />

            <TextField
                className={classes.row}
                fullWidth={true}
                multiline={true}
                rows={4}
                label={i18n.t("Description")}
                value={fields.description ?? ""}
                onChange={updateTextField("description")}
            />
        </ConfirmationDialog>
    );
};

const useStyles = makeStyles({
    row: {
        marginBottom: 25,
    },
});
