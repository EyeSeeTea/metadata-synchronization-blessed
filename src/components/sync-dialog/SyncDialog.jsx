import React from "react";
import i18n from "@dhis2/d2-i18n";
import PropTypes from "prop-types";
import _ from "lodash";
import { ConfirmationDialog, MultiSelector } from "d2-ui-components";
import DialogContent from "@material-ui/core/DialogContent";
import { withLoading } from "d2-ui-components";

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
        this.props.loading.show(true, i18n.t("Synchronizing metadata"));

        try {
            const metadataPackage = await startSynchronization(this.props.d2, {
                metadata: this.props.metadata,
                targetInstances: this.state.targetInstances,
            });
            this.props.handleClose(metadataPackage);
        } catch (error) {
            console.error(error);
            this.props.handleClose();
        }
        this.setState({ targetInstances: [] });
        this.props.loading.reset();
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
