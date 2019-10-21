import React from "react";
import i18n from "@dhis2/d2-i18n";
import PropTypes from "prop-types";
import _ from "lodash";
import { ConfirmationDialog, MultiSelector } from "d2-ui-components";
import DialogContent from "@material-ui/core/DialogContent";

import Instance from "../../models/instance";
import SyncParamsSelector from "../sync-params-selector/SyncParamsSelector";

/**
 * TODO: This class is new version of SyncDialog using sync rule model and wizard
 * to on-demand synchronizations. On the future old SyncDialog should be deleted
 * when not used
 */

class SyncWizardDialog extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        isOpen: PropTypes.bool.isRequired,
        metadataIds: PropTypes.array.isRequired,
        handleClose: PropTypes.func.isRequired,
        task: PropTypes.func.isRequired,
    };

    state = {
        syncRule: PropTypes.object.isRequired
    };

    handleExecute = async () => {
        const { task } = this.props;
        const { syncRule } = this.state;

        await task({ syncRule });
        //this.setState({ targetInstances: [], syncParams: defaultSyncParams });
    };

    handleCancel = () => {
        this.props.handleClose();
    };

    render() {
        const { d2, isOpen } = this.props;
        const { syncRule } = this.state;
        const disableSync = true; //; _.isEmpty(targetInstances);

        return (
            <React.Fragment>
                <ConfirmationDialog
                    isOpen={isOpen}
                    title={i18n.t("Synchronize Metadata")}
                    onSave={this.handleExecute}
                    onCancel={this.handleCancel}
                    saveText={i18n.t("Synchronize")}
                    maxWidth={"lg"}
                    fullWidth={true}
                    disableSave={disableSync}
                >
                    <DialogContent>
                        <span>Wizard</span>
                    </DialogContent>
                </ConfirmationDialog>
            </React.Fragment>
        );
    }
}

export default SyncWizardDialog;
