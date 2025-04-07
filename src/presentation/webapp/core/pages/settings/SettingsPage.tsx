import { ConfirmationDialog, useLoading, useSnackbar } from "@eyeseetea/d2-ui-components";
import { Button, FormGroup, makeStyles, Paper, TextField } from "@material-ui/core";
import React, { useCallback, useEffect } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import i18n from "../../../../../utils/i18n";
import PageHeader from "../../../../react/core/components/page-header/PageHeader";
import { StorageSettingDropdown } from "./storage/StorageSettingDropdown";
import { useSettings } from "./useSettings";

export const SettingsPage: React.FC = () => {
    const history = useHistory();
    const classes = useStyles();
    const snackbar = useSnackbar();

    const loading = useLoading();

    const {
        storageType,
        settingsForm,
        onChangeSettings,
        onCancel,
        onSave,
        dialogProps,
        loadingMessage,
        error,
        setStorageType,
        info,
    } = useSettings();

    const backHome = useCallback(() => history.push("/dashboard"), [history]);

    useEffect(() => {
        if (loadingMessage) {
            loading.show(true, loadingMessage);
        } else {
            loading.reset();
        }
    }, [loading, loadingMessage]);

    useEffect(() => {
        if (error) {
            snackbar.error(error);
        } else if (info) {
            snackbar.info(info);
        }
    }, [error, info, snackbar]);

    const onChangeRetentionDays = useCallback(
        (event: React.ChangeEvent<{ value: string }>) => {
            onChangeSettings({ ...settingsForm, historyRetentionDays: event.target.value });
        },
        [onChangeSettings, settingsForm]
    );

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Settings")} onBackClick={backHome} />

            <Paper className={classes.container}>
                <h4 className={classes.title}>{i18n.t("Application storage")}</h4>

                <FormGroup className={classes.content} row={true}>
                    <StorageSettingDropdown
                        selectedOption={storageType}
                        onChangeStorage={storage => {
                            setStorageType(storage);
                        }}
                    />
                </FormGroup>

                <h4 className={classes.title}>{i18n.t("History")}</h4>

                <TextField
                    fullWidth={true}
                    label={i18n.t("Retention days")}
                    value={settingsForm.historyRetentionDays.value}
                    error={settingsForm.historyRetentionDays.hasError}
                    helperText={settingsForm.historyRetentionDays.message || i18n.t("Leave empty to keep all history")}
                    onChange={onChangeRetentionDays}
                />

                <ButtonsContainer>
                    <Button key={"cancel"} autoFocus onClick={onCancel}>
                        {i18n.t("Cancel")}
                    </Button>

                    <Button key={"save"} color="primary" onClick={onSave}>
                        {i18n.t("Save")}
                    </Button>
                </ButtonsContainer>
            </Paper>
            {dialogProps && <ConfirmationDialog isOpen={true} maxWidth={"xl"} {...dialogProps} />}
        </React.Fragment>
    );
};

const useStyles = makeStyles({
    content: { margin: "1rem", marginBottom: 35, marginLeft: 0 },
    title: { marginTop: 0 },
    container: { margin: "1rem", padding: "1rem" },
});

const ButtonsContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: end;
`;
