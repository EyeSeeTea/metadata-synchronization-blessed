import { Button, ButtonProps, DialogContent, Icon, IconButton, TextField, Tooltip } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import {
    ConfirmationDialog,
    ConfirmationDialogProps,
    DialogButton,
    useLoading,
    useSnackbar,
} from "@eyeseetea/d2-ui-components";
import React, { useCallback, useMemo, useState } from "react";
import { GitHubError } from "../../../../../domain/packages/entities/Errors";
import { Store } from "../../../../../domain/stores/entities/Store";
import i18n from "../../../../../locales";
import { useAppContext } from "../../contexts/AppContext";
import Linkify from "react-linkify";
import helpStoreGithub from "../../../../assets/img/help-store-github.png";

interface StoreCreationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: (store: Store) => void;
}

const initialState = { id: "", token: "", account: "", repository: "", default: false };

const StoreCreationDialog: React.FC<StoreCreationDialogProps> = ({ isOpen, onClose, onSaved }) => {
    const { compositionRoot } = useAppContext();
    const classes = useStyles();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const [state, setState] = useState<Store>(initialState);
    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);

    const onChangeField = (field: keyof Store) => {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            setState(state => ({ ...state, [field]: value }));
        };
    };

    const validateError = useCallback((error?: GitHubError): string => {
        switch (error) {
            case "NO_TOKEN":
                return i18n.t("The token is empty");
            case "NO_ACCOUNT":
                return i18n.t("The account is empty");
            case "NO_REPOSITORY":
                return i18n.t("The repository is empty");
            case "BAD_CREDENTIALS":
                return i18n.t("The token is invalid");
            case "NOT_FOUND":
                return i18n.t("Repository not found");
            case "UNKNOWN":
            default:
                return i18n.t("Unknown error");
        }
    }, []);

    const testConnection = useCallback(async () => {
        loading.show(true, i18n.t("Testing GitHub connection"));

        const validation = await compositionRoot.store.validate(state as Store);
        validation.match({
            error: error => {
                snackbar.error(validateError(error));
            },
            success: () => {
                snackbar.success(i18n.t("Connected successfully"));
            },
        });

        loading.reset();
    }, [compositionRoot, state, validateError, snackbar, loading]);

    const save = useCallback(async () => {
        loading.show(true, i18n.t("Saving store connection"));

        const handleError = (error: GitHubError) => {
            switch (error) {
                case "NO_TOKEN":
                case "NO_ACCOUNT":
                case "NO_REPOSITORY":
                    return snackbar.error(validateError(error));
                default: {
                    updateDialog({
                        title: validateError(error),
                        description: i18n.t(
                            "There are issues with the connection details you provided.\nDo you want to proceed?"
                        ),
                        onCancel: () => {
                            updateDialog(null);
                        },
                        onSave: async () => {
                            const saveResult = await compositionRoot.store.update(state as Store, false);

                            saveResult.match({
                                error: error => snackbar.error(validateError(error)),
                                success: store => {
                                    updateDialog(null);
                                    onSaved(store);
                                    setState(initialState);
                                },
                            });
                        },
                        cancelText: i18n.t("Cancel"),
                        saveText: i18n.t("Proceed"),
                    });
                }
            }
        };

        const result = await compositionRoot.store.update(state as Store);
        result.match({
            error: error => handleError(error),
            success: store => {
                onSaved(store);
                setState(initialState);
            },
        });

        loading.reset();
    }, [compositionRoot, state, validateError, loading, snackbar, onSaved]);

    return (
        <React.Fragment>
            <ConfirmationDialog
                isOpen={isOpen}
                title={<DialogTitle />}
                onSave={save}
                onCancel={onClose}
                saveText={i18n.t("Save")}
                maxWidth={"lg"}
                fullWidth={true}
            >
                <DialogContent>
                    <TextField
                        className={classes.row}
                        fullWidth={true}
                        label={i18n.t("GitHub account or organisation (*)")}
                        value={state.account ?? ""}
                        onChange={onChangeField("account")}
                    />

                    <TextField
                        className={classes.row}
                        fullWidth={true}
                        label={i18n.t("GitHub repository (*)")}
                        value={state.repository ?? ""}
                        onChange={onChangeField("repository")}
                    />

                    <TextField
                        className={classes.row}
                        fullWidth={true}
                        label={i18n.t("GitHub personal access token (*)")}
                        value={state.token ?? ""}
                        onChange={onChangeField("token")}
                    />

                    <Button variant="contained" onClick={testConnection}>
                        {i18n.t("Test Connection")}
                    </Button>
                </DialogContent>
            </ConfirmationDialog>

            {dialogProps && <ConfirmationDialog isOpen={true} maxWidth={"xl"} {...dialogProps} />}
        </React.Fragment>
    );
};

const useStyles = makeStyles({
    row: {
        marginBottom: 25,
    },
    helpImage: {
        width: "75%",
    },
    center: {
        textAlign: "center",
    },
});

export default StoreCreationDialog;

const HelpButton: React.FC<ButtonProps> = ({ onClick }) => (
    <Tooltip title={i18n.t("Help")}>
        <IconButton onClick={onClick}>
            <Icon color="primary">help</Icon>
        </IconButton>
    </Tooltip>
);

const DialogTitle: React.FC = () => {
    const classes = useStyles();

    const helpContainer = useMemo(
        () => (
            <Linkify>
                <p>{i18n.t("To connect with a module store you need to:")}</p>
                <p>
                    {i18n.t("- Create a repository at https://github.com/new", {
                        nsSeparator: false,
                    })}
                </p>
                <p>
                    {i18n.t("- Create a personal access token at https://github.com/settings/tokens/new", {
                        nsSeparator: false,
                    })}
                </p>
                <p>
                    {i18n.t(
                        "The personal access token requires either 'public_repo' or 'repo' scopes depending if the repository is public or private"
                    )}
                </p>
                <div className={classes.center}>
                    <img
                        className={classes.helpImage}
                        src={helpStoreGithub}
                        alt={i18n.t("Create a personal access token on GitHub")}
                    />
                </div>
            </Linkify>
        ),
        [classes]
    );

    return (
        <div>
            {i18n.t("New store")}
            <DialogButton
                buttonComponent={HelpButton}
                title={i18n.t("Help")}
                maxWidth={"lg"}
                fullWidth={true}
                contents={helpContainer}
            />
        </div>
    );
};
