import { Box, Button, Grid, Typography } from "@material-ui/core";
import { CloudDownload as CloudDownloadIcon, CloudUpload as CloudUploadIcon } from "@material-ui/icons";
import _ from "lodash";
import React from "react";
import { WmrRequisiteType } from "../../../domain/entities/wmr/entities/WmrRequisite";
import i18n from "../../../utils/i18n";
import { NoticeBox } from "./components/NoticeBox";
import { useWmrSetup, WmrSetupStatusType } from "./hooks/useWmrSetup";

function PrerequisiteItem({
    type,
    status,
    downloadUrl,
    importFunction,
}: {
    type: WmrRequisiteType;
    status: WmrSetupStatusType;
    downloadUrl: string;
    importFunction: (type: WmrRequisiteType) => void;
}) {
    const itemName = type === "metadata" ? "metadata package" : "Autogenform configuration";
    const messagesByStatus: Record<WmrSetupStatusType, string> = {
        loading: i18n.t("Checking {{itemName}}...", { itemName }),
        uploading: i18n.t("Uploading {{itemName}}...", { itemName }),
        done: i18n.t("The {{itemName}} is already installed.", { itemName }),
        error: i18n.t(
            "An error occurred while installing the {{itemName}}. Alternatively, you can download the configuration and import it manually",
            { itemName }
        ),
        pending: i18n.t("The {{itemName}} is not installed yet. Use the button below to install it.", { itemName }),
    };
    const getTypeFromWmrStatus = (status: WmrSetupStatusType) => {
        switch (status) {
            case "loading":
            case "uploading":
                return "loading";
            case "done":
                return "success";
            case "error":
                return "error";
            case "pending":
                return "info";
            default:
                return "info";
        }
    };
    return (
        <NoticeBox type={getTypeFromWmrStatus(status)} message={messagesByStatus[status]}>
            {status === "pending" ? (
                <Box py={2}>
                    <Button
                        onClick={() => importFunction(type)}
                        variant="contained"
                        color="primary"
                        endIcon={<CloudUploadIcon />}
                    >
                        {i18n.t(`Setup ${itemName}`)}
                    </Button>
                </Box>
            ) : status === "error" ? (
                <Box py={2}>
                    <Button
                        download={`${_.snakeCase(itemName)}.json`}
                        href={downloadUrl}
                        variant="contained"
                        color="primary"
                        endIcon={<CloudDownloadIcon />}
                    >
                        {i18n.t(`Download ${itemName}`)}
                    </Button>
                </Box>
            ) : null}
        </NoticeBox>
    );
}

export function InstallMetadataPackage() {
    const { setupStatuses, setupRequisite, verifyRequisite } = useWmrSetup();

    React.useEffect(() => {
        verifyRequisite("metadata");
        verifyRequisite("dataStore");
    }, [verifyRequisite]);

    return (
        <Grid container spacing={3}>
            <Grid item xs={12}>
                <Typography variant="h4" gutterBottom>
                    {i18n.t("Setup WMR prerequisites")}
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                    {i18n.t("Metadata package")}
                </Typography>
                <Typography variant="caption" gutterBottom>
                    {i18n.t("This package contains the WMR dataset and its dependencies")}
                </Typography>
                <PrerequisiteItem
                    type="metadata"
                    status={setupStatuses.metadata.status}
                    downloadUrl="wmr/metadata.json"
                    importFunction={setupRequisite}
                />
            </Grid>
            <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                    {i18n.t("Autogenform configuration")}
                </Typography>
                <Typography variant="caption" gutterBottom>
                    {i18n.t("Contains the dataStore configurations required by the autogenforms tool")}
                </Typography>
                <PrerequisiteItem
                    type="dataStore"
                    status={setupStatuses.dataStore.status}
                    downloadUrl="wmr/dataStore.json"
                    importFunction={setupRequisite}
                />
            </Grid>
        </Grid>
    );
}
