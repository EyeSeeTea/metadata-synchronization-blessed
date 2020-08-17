import { Button, Paper, TextField } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import {
    ConfirmationDialog,
    ConfirmationDialogProps,
    useLoading,
    useSnackbar,
} from "d2-ui-components";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Linkify from "react-linkify";
import { useHistory } from "react-router-dom";
import { GitHubError } from "../../../../domain/packages/entities/Errors";
import { Store } from "../../../../domain/packages/entities/Store";
import i18n from "../../../../locales";
import { useAppContext } from "../../../common/contexts/AppContext";
import PageHeader from "../../components/page-header/PageHeader";

const ModulesConfigPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const history = useHistory();
    const classes = useStyles();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const [state, setState] = useState<Partial<Store>>({});
    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);

    useEffect(() => {
        compositionRoot.store.get().then(setState);
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
            case "NO_TOKEN":
                return i18n.t("The token is empty");
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

    const reset = useCallback(async () => {
        updateDialog({
            title: i18n.t("Reset store configuration"),
            description: i18n.t(
                "You will clear the existing configuration for all users in this instance.\nDo you want to proceed?"
            ),
            onCancel: () => {
                updateDialog(null);
            },
            onSave: async () => {
                await compositionRoot.store.update({} as Store, false);
                updateDialog(null);
                setState({} as Store)
            },
            cancelText: i18n.t("Cancel"),
            saveText: i18n.t("Proceed"),
        });
    }, [compositionRoot]);

    const save = useCallback(async () => {
        loading.show(true, i18n.t("Saving store connection"));

        const validation = await compositionRoot.store.update(state as Store);
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
                        await compositionRoot.store.update(state as Store, false);
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
    }, [compositionRoot, state, validateError, close, loading]);

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
                    {i18n.t(
                        "- Create a personal access token at https://github.com/settings/tokens/new",
                        { nsSeparator: false }
                    )}
                </p>
                <p>
                    {i18n.t(
                        "The personal access token requires either 'public_repo' or 'repo' scopes depending if the repository is public or private"
                    )}
                </p>
                <div className={classes.center}>
                    <img
                        className={classes.helpImage}
                        src="/img/help-store-github.png"
                        alt={i18n.t("Create a personal access token on GitHub")}
                    />
                </div>
            </Linkify>
        ),
        [classes]
    );

    return (
        <React.Fragment>
            {dialogProps && <ConfirmationDialog isOpen={true} maxWidth={"xl"} {...dialogProps} />}

            <PageHeader
                title={i18n.t("Module store connection")}
                onBackClick={close}
                help={helpContainer}
                helpSize={"lg"}
            />

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
                    label={i18n.t("GitHub personal access token (*)")}
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
                        <Button
                            variant="contained"
                            onClick={reset}
                            className={classes.actionButton}
                        >
                            {i18n.t("Reset")}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={testConnection}
                            className={classes.actionButton}
                        >
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
    actionButton: {
        margin: 10,
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
    helpImage: {
        width: "75%",
    },
    center: {
        textAlign: "center",
    },
});

export default ModulesConfigPage;
