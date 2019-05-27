import React from "react";
import i18n from "@dhis2/d2-i18n";
import PropTypes from "prop-types";
import _ from "lodash";
import { ConfirmationDialog, MultiSelector, withLoading } from "d2-ui-components";
import DialogContent from "@material-ui/core/DialogContent";

import Instance from "../../models/instance";
import { startSynchronization } from "../../logic/synchronization";

class SyncDialog extends React.Component {
    state = {
        instanceOptions: [],
        targetInstances: [],
    };

    static propTypes = {
        d2: PropTypes.object.isRequired,
        isOpen: PropTypes.bool.isRequired,
        metadata: PropTypes.object.isRequired,
        handleClose: PropTypes.func.isRequired,
        loading: PropTypes.object.isRequired,
    };

    async componentDidMount() {
        const instances = await Instance.list(
            this.props.d2,
            { search: "" },
            { page: 1, pageSize: 100, sorting: [] }
        );
        const instanceOptions = instances.objects.map(instance => ({
            value: instance.id,
            text: `${instance.name} (${instance.url} with user ${instance.username})`,
        }));
        this.setState({ instanceOptions });
    }

    onChangeInstances = targetInstances => {
        this.setState({ targetInstances });
    };

    handleSynchronization = async () => {
        const { handleClose, loading, metadata, d2 } = this.props;
        const { targetInstances } = this.state;
        loading.show(true, i18n.t("Synchronizing metadata"));

        try {
            const builder = {
                metadata: metadata,
                targetInstances: targetInstances,
            };
            for await (const { message, syncReport, done } of startSynchronization(d2, builder)) {
                if (message) loading.show(true, message);
                if (syncReport) await syncReport.save();
                if (done) handleClose(syncReport);
            }
        } catch (error) {
            console.error(error);
            handleClose();
        }
        this.setState({ targetInstances: [] });
        loading.reset();
    };

    handleCancel = () => {
        this.props.handleClose();
    };

    render() {
        const { d2, isOpen } = this.props;
        const { targetInstances } = this.state;
        const disableSync = _.isEmpty(targetInstances);

        return (
            <React.Fragment>
                <ConfirmationDialog
                    isOpen={isOpen}
                    title={i18n.t("Synchronize Metadata")}
                    onSave={this.handleSynchronization}
                    onCancel={this.handleCancel}
                    saveText={i18n.t("Synchronize")}
                    maxWidth={"lg"}
                    fullWidth={true}
                    disableSave={disableSync}
                >
                    <DialogContent>
                        <MultiSelector
                            d2={d2}
                            height={300}
                            onChange={this.onChangeInstances}
                            options={this.state.instanceOptions}
                        />
                    </DialogContent>
                </ConfirmationDialog>
            </React.Fragment>
        );
    }
}

export default withLoading(SyncDialog);
