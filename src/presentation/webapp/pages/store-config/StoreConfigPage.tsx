import { Button, Paper, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import {
    ConfirmationDialog,
    ConfirmationDialogProps,
    useLoading,
    useSnackbar,
} from "d2-ui-components";
import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import PageHeader from "../../components/page-header/PageHeader";
import { useAppContext } from "../../../common/contexts/AppContext";
import { GitHubError } from "../../../../domain/modules/entities/Errors";
import { Store } from "../../../../domain/modules/entities/Store";
import i18n from "../../../../locales";

const ModulesConfigPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const history = useHistory();
    const classes = useStyles();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const [state, setState] = useState<Partial<Store>>({});
    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);

    useEffect(() => {
        compositionRoot
            .store()
            .get()
            .then(setState);
    }, [compositionRoot]);

    const onChangeField = (field: keyof Store) => {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            setState(state => ({ ...state, [field]: value }));
        };
    };

    const close = useCallback(() => {
        history.push("/");
    }, [history]);

    const validateError = useCallback((error?: GitHubError): string => {
        switch (error) {
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

        if (state.token && state.account && state.repository) {
            const validation = await compositionRoot.store().validate(state as Store);
            validation.match({
                error: error => {
                    snackbar.error(validateError(error));
                },
                success: () => {
                    snackbar.success(i18n.t("Connected successfully"));
                },
            });
        } else {
            snackbar.warning(i18n.t("You need to provide all fields"));
        }

        loading.reset();
    }, [compositionRoot, state, validateError, snackbar, loading]);

    const save = useCallback(async () => {
        loading.show(true, i18n.t("Saving store connection"));

        if (state.token && state.account && state.repository) {
            const validation = await compositionRoot.store().update(state as Store);
            validation.match({
                error: error => {
                    updateDialog({
                        title: validateError(error),
                        description: i18n.t(
                            "There are issues with the connection details you provided.\nDo you want to proceed?"
                        ),
                        onCancel: () => {
                            updateDialog(null);
                        },
                        onSave: async () => {
                            await compositionRoot.store().update(state as Store, false);
                            updateDialog(null);
                            close();
                        },
                        cancelText: i18n.t("Cancel"),
                        saveText: i18n.t("Proceed"),
                    });
                },
                success: close,
            });

            loading.reset();
        } else {
            snackbar.warning(i18n.t("You need to provide all fields"));
            loading.reset();
        }
    }, [compositionRoot, state, validateError, close, snackbar, loading]);

    return (
        <React.Fragment>
            {dialogProps && <ConfirmationDialog isOpen={true} maxWidth={"xl"} {...dialogProps} />}

            <PageHeader title={i18n.t("Module store connection")} onBackClick={close} />

            <Paper className={classes.paper}>
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
                    label={i18n.t("GitHub access token (*)")}
                    value={state.token ?? ""}
                    onChange={onChangeField("token")}
                />

                <div className={classes.buttonContainer}>
                    <div>
                        <Button variant="contained" className={classes.saveButton} onClick={save}>
                            {i18n.t("Save")}
                        </Button>
                        <Button
                            variant="contained"
                            className={classes.cancelButton}
                            onClick={close}
                        >
                            {i18n.t("Cancel")}
                        </Button>
                    </div>
                    <div className={classes.actionButtonsContainer}>
                        <Button variant="contained" onClick={testConnection}>
                            {i18n.t("Test Connection")}
                        </Button>
                    </div>
                </div>
            </Paper>
        </React.Fragment>
    );
};

const useStyles = makeStyles({
    paper: {
        paddingTop: 35,
        paddingLeft: 45,
        paddingRight: 45,
    },
    row: {
        marginBottom: 25,
    },
    buttonContainer: {
        display: "flex",
        justifyContent: "space-between",
        paddingBottom: 30,
    },
    actionButtonsContainer: {
        marginTop: 10,
    },
    saveButton: {
        margin: 10,
        backgroundColor: "#2b98f0",
        color: "white",
        height: 36,
        width: 140,
        borderRadius: 0,
        marginRight: 20,
        marginLeft: 0,
    },
    cancelButton: {
        margin: 10,
        backgroundColor: "white",
        borderRadius: 0,
        marginRight: 20,
        marginLeft: 0,
    },
});

export default ModulesConfigPage;
