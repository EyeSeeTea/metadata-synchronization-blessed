import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import i18n from "@dhis2/d2-i18n";
import { ObjectsTable, withSnackbar } from "d2-ui-components";
import Fab from "@material-ui/core/Fab";
import { withStyles } from "@material-ui/core/styles";
import SyncIcon from "@material-ui/icons/Sync";

import PageHeader from "../shared/PageHeader";
import SyncDialog from "../sync-dialog/SyncDialog";
import SyncSummary from "../sync-summary/SyncSummary";

const styles = theme => ({
    fab: {
        margin: theme.spacing.unit,
        position: "fixed",
        bottom: theme.spacing.unit * 5,
        right: theme.spacing.unit * 5,
    },
    tableContainer: { marginTop: -10 },
});

class BaseSyncConfigurator extends React.Component {
    state = {
        tableKey: Math.random(),
        metadata: {},
        importResponse: [],
        syncDialogOpen: false,
        syncSummaryOpen: false,
    };

    static propTypes = {
        d2: PropTypes.object.isRequired,
        model: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired,
        title: PropTypes.string.isRequired,
        snackbar: PropTypes.object.isRequired,
    };

    actions = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
            type: "details",
        },
    ];

    backHome = () => {
        this.props.history.push("/");
    };

    selectionChange = metadataSelection => {
        const metadata = {
            [this.props.model.getMetadataType()]: metadataSelection,
        };

        this.setState({ metadata });
    };

    onSynchronize = () => {
        this.setState({ syncDialogOpen: true });
    };

    handleDialogClose = importResponse => {
        if (importResponse) {
            this.setState({ syncDialogOpen: false, syncSummaryOpen: true, importResponse });
        } else {
            this.props.snackbar.error("Unknown error with the request");
            this.setState({ syncDialogOpen: false });
        }
    };

    handleSummaryClose = () => {
        this.setState({ syncSummaryOpen: false });
    };

    render() {
        const { d2, model, title, classes } = this.props;
        const { tableKey, syncDialogOpen, syncSummaryOpen, metadata, importResponse } = this.state;

        // Wrapper method to preserve static context
        const list = (...params) => model.listMethod(...params);

        return (
            <React.Fragment>
                <PageHeader onBackClick={this.backHome} title={title} />
                <div className={classes.tableContainer}>
                    <ObjectsTable
                        key={tableKey}
                        d2={d2}
                        model={model.getD2Model(d2)}
                        columns={model.getColumns()}
                        detailsFields={model.getDetails()}
                        pageSize={20}
                        initialSorting={model.getInitialSorting()}
                        actions={this.actions}
                        list={list}
                        onSelectionChange={this.selectionChange}
                    />
                    <Fab
                        color="primary"
                        aria-label="Add"
                        className={classes.fab}
                        size="large"
                        onClick={this.onSynchronize}
                        data-test="list-action-bar"
                    >
                        <SyncIcon />
                    </Fab>
                </div>
                <SyncDialog
                    d2={d2}
                    metadata={metadata}
                    isOpen={syncDialogOpen}
                    handleClose={this.handleDialogClose}
                />
                <SyncSummary
                    response={importResponse}
                    isOpen={syncSummaryOpen}
                    handleClose={this.handleSummaryClose}
                />
            </React.Fragment>
        );
    }
}

export default withRouter(withSnackbar(withStyles(styles)(BaseSyncConfigurator)));
