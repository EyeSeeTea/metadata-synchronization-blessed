import React from "react";
import { useLoading } from "@eyeseetea/d2-ui-components";
import { Button, Typography, Box } from "@material-ui/core";
import { CloudUpload as SyncIcon } from "@material-ui/icons";
import i18n from "../../../utils/i18n";
import { Instance } from "../../../domain/instance/entities/Instance";
import { Maybe } from "../../../types/utils";
import { Id } from "../../../domain/common/entities/Schemas";
import { OrgUnitInput } from "./components/OrgUnitInput";
import { NoticeBox } from "./components/NoticeBox";
import { useSyncRemoteWmr } from "./hooks/useSyncRemoteWmr";
import { RemoteInstanceSelector } from "./components/RemoteInstanceSelector";
import { SummaryTable } from "../../react/core/components/sync-summary/SummaryTable";

export function SubmitWmr() {
    const loading = useLoading();
    const [selectedTargetInstance, setSelectedTargetInstance] = React.useState<Instance | null>(null);
    const [targetOrgUnitId, setTargetOrgUnitId] = React.useState<Maybe<Id>>();
    const { syncRemoteWmr, wmrRemoteSyncResult } = useSyncRemoteWmr({
        instance: selectedTargetInstance,
        targetOrgUnitId,
    });

    const sendIsDisabled = !selectedTargetInstance?.url || !targetOrgUnitId || loading.isLoading;
    if (wmrRemoteSyncResult) {
        return (
            <Box>
                <Typography variant="h4" gutterBottom>
                    {i18n.t("Submit WMR Data")}
                </Typography>
                {wmrRemoteSyncResult?.type === "success" ? (
                    <NoticeBox type="success" message={i18n.t("Data successfully submitted to the target instance.")} />
                ) : wmrRemoteSyncResult?.type === "warning" ? (
                    <NoticeBox type="warning" message={i18n.t("Data submitted with warnings.")} />
                ) : (
                    <NoticeBox
                        type="error"
                        message={wmrRemoteSyncResult.message || i18n.t("Data submission failed.")}
                    />
                )}
                {wmrRemoteSyncResult.stats && <SummaryTable stats={[wmrRemoteSyncResult.stats]} />}
            </Box>
        );
    }
    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                {i18n.t("Submit WMR Data")}
            </Typography>
            <Box>
                <NoticeBox
                    type="info"
                    message={i18n.t(
                        "Your data is ready for submission. Please select a target DHIS2 Instance and Organisation Unit:"
                    )}
                />
            </Box>
            <RemoteInstanceSelector
                value={selectedTargetInstance}
                onChange={instance => {
                    setTargetOrgUnitId(null);
                    setSelectedTargetInstance(instance);
                }}
            />
            {selectedTargetInstance?.url && (
                <Box p={2}>
                    <OrgUnitInput instance={selectedTargetInstance} onChange={setTargetOrgUnitId} />
                </Box>
            )}
            <Box p={2}>
                <NoticeBox
                    type={selectedTargetInstance?.url ? "success" : "error"}
                    message={
                        selectedTargetInstance?.url
                            ? `${i18n.t("Target Instance ")}: ${selectedTargetInstance.url}`
                            : i18n.t("Please select a target instance to submit the data")
                    }
                />
                <NoticeBox
                    type={targetOrgUnitId ? "success" : "error"}
                    message={
                        targetOrgUnitId
                            ? `${i18n.t("Target Organisation Unit Id")}: ${targetOrgUnitId}`
                            : i18n.t("Please provide a target organisation unit ID and Validate it")
                    }
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={syncRemoteWmr}
                    endIcon={<SyncIcon />}
                    disabled={sendIsDisabled}
                    style={{ margin: "1em 0" }}
                >
                    {i18n.t("Send DataValues to target instance")}
                </Button>
            </Box>
        </Box>
    );
}
