import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import _ from "lodash";
import { withSnackbar } from "d2-ui-components";
import SyncIcon from "@material-ui/icons/Sync";
import { withRouter } from "react-router-dom";

import MetadataTable from "../metadata-table/MetadataTable";
import SyncDialog from "../sync-dialog/SyncDialog";
import SyncSummary from "../sync-summary/SyncSummary";
import PageHeader from "../page-header/PageHeader";
import SyncReport from "../../models/syncReport";

class GenericSynchronizationPage extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        snackbar: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        title: PropTypes.string.isRequired,
    };

    state = {
        selectedIds: [],
        metadata: {},
        importResponse: SyncReport.create(),
        syncDialogOpen: false,
        syncSummaryOpen: false,
    };

    changeSelection = (model, selectedIds) => {
        const metadata = {
            [model.getMetadataType()]: selectedIds,
        };

        this.setState({ metadata, selectedIds });
    };

    startSynchronization = () => {
        const disabled = _(this.state.metadata)
            .values()
            .some(_.isEmpty);
        if (disabled) {
            this.props.snackbar.error(
                i18n.t("Please select at least one element from the table to synchronize")
            );
        } else {
            this.setState({ syncDialogOpen: true });
        }
    };

    closeDialog = importResponse => {
        if (importResponse) {
            this.setState({ syncDialogOpen: false, syncSummaryOpen: true, importResponse });
        } else {
            this.props.snackbar.error(i18n.t("Unknown error with the request"));
            this.setState({ syncDialogOpen: false });
        }
    };

    closeSummary = () => {
        this.setState({ syncSummaryOpen: false });
    };

    goHome = () => {
        this.props.history.push("/");
    };

    render() {
        const { d2, title, models } = this.props;
        const {
            syncDialogOpen,
            syncSummaryOpen,
            metadata,
            importResponse,
            selectedIds,
        } = this.state;

        return (
            <React.Fragment>
                <PageHeader onBackClick={this.goHome} title={title} />

                <MetadataTable
                    d2={d2}
                    models={models}
                    initialModel={models[0]}
                    initialSelection={selectedIds}
                    notifyNewSelection={this.changeSelection}
                    onButtonClick={this.startSynchronization}
                    buttonLabel={<SyncIcon />}
                />

                <SyncDialog
                    d2={d2}
                    metadata={metadata}
                    isOpen={syncDialogOpen}
                    handleClose={this.closeDialog}
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

export default withSnackbar(withRouter(GenericSynchronizationPage));
