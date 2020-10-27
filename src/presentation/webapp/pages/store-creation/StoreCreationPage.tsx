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
import { useHistory, useParams } from "react-router-dom";
import { GitHubError } from "../../../../domain/packages/entities/Errors";
import { Store } from "../../../../domain/packages/entities/Store";
import i18n from "../../../../locales";
import { useAppContext } from "../../../react/contexts/AppContext";
import PageHeader from "../../../react/components/page-header/PageHeader";
import helpStoreGithub from "../../../../assets/img/help-store-github.png";

const StoreCreationPage: React.FC = () => {
    const { compositionRoot } = useAppContext();
    const history = useHistory();
    const classes = useStyles();
    const snackbar = useSnackbar();
    const loading = useLoading();

    const { id, action } = useParams<{ id: string; action: "edit" | "new" }>();

    const [state, setState] = useState<Store>({
        id: "",
        token: "",
        account: "",
        repository: "",
        default: false,
    });
    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);

    const isEdit = action === "edit" && (!!module || !!id);
    const title = !isEdit ? i18n.t(`New store`) : i18n.t(`Edit store`);

    useEffect(() => {
        if (id)
            compositionRoot.store.get(id).then(store => {
                if (store) {
                    setState(store);
                } else {
                    snackbar.error(i18n.t("Store not found: " + id));
                }
            });
    }, [compositionRoot, id, snackbar]);

    const onChangeField = (field: keyof Store) => {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            setState(state => ({ ...state, [field]: value }));
        };
    };

    const close = useCallback(() => {
        history.goBack();
    }, [history]);

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
                            await compositionRoot.store.update(state as Store, false);
                            updateDialog(null);
                            close();
                        },
                        cancelText: i18n.t("Cancel"),
                        saveText: i18n.t("Proceed"),
                    });
                }
            }
        };

        const validation = await compositionRoot.store.update(state as Store);
        validation.match({
            error: error => handleError(error),
            success: close,
        });

        loading.reset();
    }, [compositionRoot, state, validateError, close, loading, snackbar]);

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
                        src={helpStoreGithub}
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

            <PageHeader title={title} onBackClick={close} help={helpContainer} helpSize={"lg"} />

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

export default StoreCreationPage;
