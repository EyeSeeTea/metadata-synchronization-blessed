import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { withSnackbar, withLoading } from "d2-ui-components";
import SyncIcon from "@material-ui/icons/Sync";
import { withRouter } from "react-router-dom";

import { startSynchronization } from "../../logic/synchronization";
import { startDelete } from "../../logic/delete";
import MetadataTable from "../metadata-table/MetadataTable";
import SyncDialog from "../sync-dialog/SyncDialog";
import SyncSummary from "../sync-summary/SyncSummary";
import PageHeader from "../page-header/PageHeader";
import SyncReport from "../../models/syncReport";

class GenericSynchronizationPage extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        snackbar: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        title: PropTypes.string.isRequired,
        isDelete: PropTypes.bool,
    };

    state = {
        metadataIds: [],
        importResponse: SyncReport.create(),
        syncDialogOpen: false,
        syncSummaryOpen: false,
    };

    goHome = () => {
        this.props.history.push("/");
    };

    closeSummary = () => {
        this.setState({ syncSummaryOpen: false });
    };

    changeSelection = metadataIds => {
        this.setState({ metadataIds });
    };

    startSynchronization = () => {
        const { metadataIds } = this.state;

        if (metadataIds.length > 0) {
            this.setState({ syncDialogOpen: true });
        } else {
            this.props.snackbar.error(
                i18n.t("Please select at least one element from the table to synchronize")
            );
        }
    };

    finishSynchronization = importResponse => {
        if (importResponse) {
            this.setState({ syncDialogOpen: false, syncSummaryOpen: true, importResponse });
        } else {
            this.props.snackbar.error(i18n.t("Unknown error with the request"));
            this.setState({ syncDialogOpen: false });
        }
    };

    handleSynchronization = async targetInstances => {
        const { isDelete, loading, d2 } = this.props;
        const { metadataIds } = this.state;

        const action = isDelete ? startDelete : startSynchronization;
        loading.show(true, i18n.t("Synchronizing metadata"));

        try {
            const builder = { metadataIds, targetInstances };
            for await (const { message, syncReport, done } of action(d2, builder)) {
                if (message) loading.show(true, message);
                if (syncReport) await syncReport.save(d2);
                if (done) {
                    loading.reset();
                    this.finishSynchronization(syncReport);
                    return;
                }
            }
        } catch (error) {
            console.error(error);
        }

        loading.reset();
    };

    render() {
        const { d2, isAdmin, title, models, ...rest } = this.props;
        const {
            syncDialogOpen,
            syncSummaryOpen,
            importResponse,
            metadataIds,
        } = this.state;

        return (
            <React.Fragment>
                <PageHeader onBackClick={this.goHome} title={title} />

                <MetadataTable
                    d2={d2}
                    models={models}
                    initialModel={models[0]}
                    initialSelection={metadataIds}
                    notifyNewSelection={this.changeSelection}
                    onButtonClick={isAdmin ? this.startSynchronization : null}
                    buttonLabel={<SyncIcon />}
                    {...rest}
                />

                <SyncDialog
                    d2={d2}
                    metadataIds={metadataIds}
                    isOpen={syncDialogOpen}
                    handleClose={this.finishSynchronization}
                    task={this.handleSynchronization}
                />

                <SyncSummary
                    d2={d2}
                    response={importResponse}
                    isOpen={syncSummaryOpen}
                    handleClose={this.closeSummary}
                />
            </React.Fragment>
        );
    }
}

export default withLoading(withSnackbar(withRouter(GenericSynchronizationPage)));
