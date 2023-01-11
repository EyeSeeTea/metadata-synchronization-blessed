import { ConfirmationDialog } from "@eyeseetea/d2-ui-components";
import { DialogContent, List, ListItem } from "@material-ui/core";
import i18n from "../../../../../locales";

interface PackageValidationSummaryProps {
    errors: string[];
    onClose: () => void;
}

const PackageValidationSummary = ({ errors, onClose }: PackageValidationSummaryProps) => {
    return (
        <ConfirmationDialog
            isOpen={true}
            title={i18n.t("Validation Errors")}
            onCancel={onClose}
            cancelText={i18n.t("Ok")}
            maxWidth={"lg"}
            fullWidth={true}
        >
            <DialogContent>
                <List>
                    {errors.map((error, index) => {
                        return <ListItem key={index}>{error}</ListItem>;
                    })}
                </List>
            </DialogContent>
        </ConfirmationDialog>
    );
};

export default PackageValidationSummary;
