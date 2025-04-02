import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import { DialogContent, List, ListItem, ListItemIcon, ListItemText } from "@material-ui/core";
import i18n from "../../../../../utils/i18n";
import ErrorIcon from "@material-ui/icons/Error";
import WarningIcon from "@material-ui/icons/Warning";

export type ValidationPackageSummary = {
    warnings: string[];
    errors: string[];
};

interface PackageValidationSummaryProps {
    summary: ValidationPackageSummary;
    onClose: () => void;
}

const PackageValidationSummary = ({ summary, onClose }: PackageValidationSummaryProps) => {
    return (
        <ConfirmationDialog
            isOpen={true}
            title={i18n.t("Validation Summary")}
            onCancel={onClose}
            cancelText={i18n.t("Ok")}
            maxWidth={"lg"}
            fullWidth={true}
        >
            <DialogContent>
                <List>
                    {summary.warnings.map((warning, index) => {
                        return (
                            <ListItem key={index}>
                                <ListItemIcon>
                                    <WarningIcon htmlColor="#ffcc00" />
                                </ListItemIcon>
                                <ListItemText primary={warning} />
                            </ListItem>
                        );
                    })}
                    {summary.errors.map((error, index) => {
                        return (
                            <ListItem key={index}>
                                <ListItemIcon>
                                    <ErrorIcon color="error" />
                                </ListItemIcon>
                                <ListItemText primary={error} />
                            </ListItem>
                        );
                    })}
                </List>
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default PackageValidationSummary;
