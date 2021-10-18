import { makeStyles, TextField } from "@material-ui/core";
import {
    ConfirmationDialog,
    ShareUpdate,
    Sharing,
    SharingRule,
    useLoading,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import _ from "lodash";
import React, { useCallback, useEffect, useState } from "react";
import { NamedRef } from "../../../../../domain/common/entities/Ref";
import { Instance } from "../../../../../domain/instance/entities/Instance";
import { SynchronizationBuilder } from "../../../../../domain/synchronization/entities/SynchronizationBuilder";
import { SynchronizationType } from "../../../../../domain/synchronization/entities/SynchronizationType";
import i18n from "../../../../../locales";
import { useAppContext } from "../../contexts/AppContext";

export interface PullRequestCreation {
    instance: Instance;
    builder: SynchronizationBuilder;
    type: SynchronizationType;
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
    const [responsibles, updateResponsibles] = useState<Set<string>>();
    const [notificationUsers, updateNotificationUsers] = useState<{
        users: SharingRule[];
        userGroups: SharingRule[];
    }>({ users: [], userGroups: [] });

    const save = useCallback(async () => {
        const { subject, description } = fields;

        if (!subject) {
            snackbar.error(i18n.t("You need to provide a subject"));
            return;
        }

        try {
            loading.show(true, i18n.t("Creating pull request"));
            const sync = compositionRoot.sync[type](builder);
            const payload = await sync.buildPayload();

            await compositionRoot.sync.createPullRequest({
                instance,
                type,
                ids: builder.metadataIds,
                payload,
                subject,
                description,
                notificationUsers: {
                    users: sharingToNamedRef(notificationUsers.users),
                    userGroups: sharingToNamedRef(notificationUsers.userGroups),
                },
            });

            onClose();
            snackbar.success(i18n.t("Pull request created"));
        } catch (err: any) {
            snackbar.error(err.message);
        } finally {
            loading.reset();
        }
    }, [compositionRoot, builder, fields, type, instance, notificationUsers, onClose, snackbar, loading]);

    const updateTextField = useCallback(
        (field: keyof PullRequestFields) => (event: React.ChangeEvent<{ value: unknown }>) => {
            const value = event.target.value as string;
            updateFields(fields => ({ ...fields, [field]: value }));
        },
        []
    );

    const onSearchRequest = useCallback(
        (key: string) => compositionRoot.instances.getApi(instance).sharing.search({ key }).getData(),
        [compositionRoot, instance]
    );

    const onSharingChanged = useCallback(async (updatedAttributes: ShareUpdate) => {
        updateNotificationUsers(({ users, userGroups }) => {
            const { userAccesses = users, userGroupAccesses = userGroups } = updatedAttributes;
            return { users: userAccesses, userGroups: userGroupAccesses };
        });
    }, []);

    useEffect(() => {
        compositionRoot.responsibles.get(builder.metadataIds, instance).then(responsibles => {
            const users = _.uniqBy(namedRefToSharing(responsibles.flatMap(({ users }) => users)), "id");
            const userGroups = _.uniqBy(namedRefToSharing(responsibles.flatMap(({ userGroups }) => userGroups)), "id");

            updateResponsibles(new Set([...users, ...userGroups].map(({ id }) => id)));
            updateNotificationUsers({ users, userGroups });
        });
    }, [compositionRoot, builder, instance]);

    return (
        <ConfirmationDialog
            isOpen={true}
            title={i18n.t("Create pull request on {{name}}", instance)}
            description={i18n.t(
                "There are custodians for the selected metadata. You can still create a pull request and, once approved by a custodian, you will be able to finish the synchronization."
            )}
            maxWidth={"md"}
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
            <Sharing
                subtitle={i18n.t("Custodians")}
                meta={{
                    meta: {},
                    object: {
                        id: "",
                        name: "",
                        userAccesses: notificationUsers.users,
                        userGroupAccesses: notificationUsers.userGroups,
                    },
                }}
                unremovebleIds={responsibles}
                onChange={onSharingChanged}
                onSearch={onSearchRequest}
                showOptions={{
                    title: false,
                    dataSharing: false,
                    publicSharing: false,
                    externalSharing: false,
                    permissionPicker: false,
                }}
            />
        </ConfirmationDialog>
    );
};

const useStyles = makeStyles({
    row: {
        marginBottom: 25,
    },
});

function namedRefToSharing(namedRefs: NamedRef[]): SharingRule[] {
    return namedRefs.map(({ id, name }) => ({ id, displayName: name, access: "------" }));
}

function sharingToNamedRef(sharings: SharingRule[]): NamedRef[] {
    return sharings.map(({ id, displayName }) => ({ id, name: displayName }));
}
