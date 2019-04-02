import React from "react";
import i18n from "@dhis2/d2-i18n";
import PropTypes from "prop-types";
import { ConfirmationDialog } from "d2-ui-components";
import DialogContent from "@material-ui/core/DialogContent";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import Typography from "@material-ui/core/Typography";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ReactJson from "react-json-view";

class SyncSummary extends React.Component {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        response: PropTypes.array.isRequired,
        handleClose: PropTypes.func.isRequired,
    };

    handleClose = () => {
        this.props.handleClose();
    };

    render() {
        const { isOpen, response } = this.props;

        return (
            <React.Fragment>
                <ConfirmationDialog
                    isOpen={isOpen}
                    title={i18n.t("Synchronization Results")}
                    onSave={this.handleClose}
                    saveText={i18n.t("Ok")}
                    maxWidth={"lg"}
                    fullWidth={true}
                >
                    <DialogContent>
                        <ExpansionPanel defaultExpanded>
                            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography>JSON Response</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <ReactJson src={response} collapsed={2} enableClipboard={false} />
                            </ExpansionPanelDetails>
                        </ExpansionPanel>
                    </DialogContent>
                </ConfirmationDialog>
            </React.Fragment>
        );
    }
}

export default SyncSummary;
