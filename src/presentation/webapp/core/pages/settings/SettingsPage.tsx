import { ConfirmationDialog, ConfirmationDialogProps, useLoading } from "@eyeseetea/d2-ui-components";
import { Button, FormGroup, makeStyles, Paper } from "@material-ui/core";
import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import styled from "styled-components";
import { StorageType } from "../../../../../domain/config/entities/Config";
import i18n from "../../../../../locales";
import PageHeader from "../../../../react/core/components/page-header/PageHeader";
import { useAppContext } from "../../../../react/core/contexts/AppContext";
import { StorageSettingDropdown } from "./storage/StorageSettingDropdown";

export const SettingsPage: React.FC = () => {
    const { compositionRoot } = useAppContext();

    const history = useHistory();
    const classes = useStyles();

    const [storageType, setStorageType] = useState<StorageType>("dataStore");
    const [savedStorageType, setSavedStorageType] = useState<StorageType>("dataStore");

    const loading = useLoading();

    const [dialogProps, updateDialog] = useState<ConfirmationDialogProps | null>(null);

    useEffect(() => {
        compositionRoot.config.getStorage().then(storage => {
            setStorageType(storage);
            setSavedStorageType(storage);
        });
    }, [compositionRoot]);

    const backHome = useCallback(() => history.push("/dashboard"), [history]);

    const changeStorage = useCallback(
        async (storage: StorageType) => {
            loading.show(true, i18n.t("Updating storage location, please wait..."));
            await compositionRoot.config.setStorage(storage);

            const newStorage = await compositionRoot.config.getStorage();
            setStorageType(newStorage);
            loading.reset();
            backHome();
        },
        [backHome, compositionRoot.config, loading]
    );

    const showConfirmationDialog = useCallback(() => {
        updateDialog({
            title: i18n.t("Change storage"),
            description: i18n.t(
                "When changing the storage of the application, all stored information will be moved to the new storage. This might take a while, please wait. Do you want to proceed?"
            ),
            onCancel: () => {
                updateDialog(null);
            },
            onSave: async () => {
                updateDialog(null);
                changeStorage(storageType);
            },
            cancelText: i18n.t("Cancel"),
            saveText: i18n.t("Proceed"),
        });
    }, [changeStorage, storageType]);

    const onChangeStorageType = useCallback((storage: StorageType) => setStorageType(storage), []);

    const onSave = useCallback(() => {
        if (storageType !== savedStorageType) {
            showConfirmationDialog();
        } else {
            backHome();
        }
    }, [backHome, savedStorageType, showConfirmationDialog, storageType]);

    const onCancel = useCallback(() => backHome(), [backHome]);

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
