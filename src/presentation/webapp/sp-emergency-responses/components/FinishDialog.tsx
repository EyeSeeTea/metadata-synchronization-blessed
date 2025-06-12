import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import { DialogContent, Typography } from "@material-ui/core";
import i18n from "../../../../utils/i18n";
import { Status } from "../EmergencyResponsesSyncHomePage";

type FinishDialogProps = {
    data: FinishData;
    onCancel: () => void;
};

export type FinishData = {
    type: "getConfiguration" | "pushData";
    isFailed: boolean;
};

export const FinishDialog: React.FC<FinishDialogProps> = ({ data, onCancel }) => {
    return (
        <ConfirmationDialog
            isOpen={true}
            onCancel={onCancel}
            maxWidth={"sm"}
            fullWidth={true}
            cancelText={i18n.t("Close")}
        >
            <DialogContent>
                {data?.type === "getConfiguration" && !data.isFailed && <GetConfigurationSuccessContent />}
                {data?.type === "getConfiguration" && data.isFailed && <GetConfigurationFailedContent />}
                {data?.type === "pushData" && !data.isFailed && <PushDataSuccessContent />}
                {data?.type === "pushData" && data.isFailed && <PushDataFailedContent />}
            </DialogContent>
        </ConfirmationDialog>
    );
};

const GetConfigurationSuccessContent = () => {
    return (
        <>
            <Typography gutterBottom>
                <Status color="success">{i18n.t("SYNCHRONIZATION SUCCESSFUL")}</Status>
            </Typography>
            <Typography gutterBottom>{i18n.t("The synchronization has been completed successfully.")}</Typography>
            <Typography gutterBottom>
                {i18n.t("Do not forget to perform the following actions:", { nsSeparator: false })}
            </Typography>
            <ul>
                <li>{i18n.t("Set up passwords manually for all users intended to use this instance")}</li>
                <li>{i18n.t("Clear the application cache")}</li>
            </ul>
        </>
    );
};

const GetConfigurationFailedContent = () => {
    return (
        <>
            <Typography gutterBottom>
                <Status color="error">{i18n.t("SYNCHRONIZATION FAILED")}</Status>
            </Typography>
            <Typography gutterBottom>
                {i18n.t(
                    "The synchronization and metadata import failed. Please, reach out an administrator and share the JSON Response obtained as an output for the synchronization rule that failed."
                )}
            </Typography>
        </>
    );
};

const PushDataSuccessContent = () => {
    return (
        <>
            <Typography gutterBottom>
                <Status color="success">{i18n.t("DATA PUSHED SUCCESSFULLY")}</Status>
            </Typography>
            <Typography gutterBottom>{i18n.t("The data was pushed successfully to the HQ server.")}</Typography>
        </>
    );
};

const PushDataFailedContent = () => {
    return (
        <>
            <Typography gutterBottom>
                <Status color="error">{i18n.t("ERROR PUSHING DATA")}</Status>
            </Typography>
            <Typography gutterBottom>
                {i18n.t(
                    "There was an error pushing the data to the HQ server. Please, reach out an administrator and share the JSON Response obtained as an output for the synchronization rule that failed."
                )}
            </Typography>
        </>
    );
};
