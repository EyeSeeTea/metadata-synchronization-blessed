import { ConfirmationDialog, useLoading } from "@eyeseetea/d2-ui-components";
import { Button, FormGroup, makeStyles, Paper } from "@material-ui/core";
import React, { useCallback, useEffect } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import i18n from "../../../../../locales";
import PageHeader from "../../../../react/core/components/page-header/PageHeader";
import { StorageSettingDropdown } from "./storage/StorageSettingDropdown";
import { useSettings } from "./useSettings";

export const SettingsPage: React.FC = () => {
    const history = useHistory();
    const classes = useStyles();

    const loading = useLoading();

    const { storageType, onChangeStorageType, onCancel, onSave, dialogProps, loadingMessage, goHome } = useSettings();

    const backHome = useCallback(() => history.push("/dashboard"), [history]);

    useEffect(() => {
        if (loadingMessage) {
            loading.show(true, loadingMessage);
        } else {
            loading.reset();
        }
    }, [loading, loadingMessage]);

    useEffect(() => {
        if (goHome) {
            backHome();
        }
    }, [backHome, goHome]);

    return (
        <React.Fragment>
            <PageHeader title={i18n.t("Settings")} onBackClick={backHome} />

            <Paper className={classes.container}>
                <h3 className={classes.title}>{i18n.t("Application storage")}</h3>

                <FormGroup className={classes.content} row={true}>
                    <StorageSettingDropdown selectedOption={storageType} onChangeStorage={onChangeStorageType} />
                </FormGroup>

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
