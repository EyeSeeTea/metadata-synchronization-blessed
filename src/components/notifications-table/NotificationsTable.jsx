import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { ObjectsTable, withSnackbar, withLoading, ConfirmationDialog } from "d2-ui-components";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import PageHeader from "../shared/PageHeader";

import SyncReport from "../../models/syncReport";

const styles = () => ({
    tableContainer: { marginTop: -10 },
});

class NotificationsTable extends React.Component {
    state = {
        tableKey: Math.random(),
        toDelete: null,
    };

    static propTypes = {
        d2: PropTypes.object.isRequired,
        snackbar: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
    };

    backHome = () => {
        this.props.history.push("/");
    };

    deleteNotification = notification => {
        this.setState({ toDelete: notification });
    };

    cancelDelete = () => {
        this.setState({ toDelete: null });
    };

    confirmDelete = async () => {
        const { toDelete } = this.state;

        const syncReport = new SyncReport(toDelete);
        this.setState({ toDelete: null });
        this.props.loading.show(true, i18n.t("Deleting notification"));

        await syncReport.remove(this.props.d2).then(response => {
            this.props.loading.reset();

            if (response.status) {
                this.props.snackbar.success(i18n.t("Deleted {{name}}", { name: toDelete.name }));

                // TODO: Workaround, add a way to force render of ObjectsTable on-demand
                this.setState({ tableKey: Math.random() });
            } else {
                this.props.snackbar.error(
                    i18n.t("Failed to delete {{name}}", { name: toDelete.name })
                );
            }
        });
    };

    columns = [
        { name: "user", text: i18n.t("User"), sortable: true },
        { name: "timestamp", text: i18n.t("Timestamp"), sortable: true },
        { name: "status", text: i18n.t("Status"), sortable: true },
    ];

    initialSorting = ["id", "asc"];

    detailsFields = [
        { name: "user", text: i18n.t("User") },
        { name: "timestamp", text: i18n.t("Timestamp") },
        { name: "status", text: i18n.t("Status") },
        // Metadata Package
        // Url to API
    ];

    actions = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
            type: "details",
        },
        {
            name: "delete",
            text: i18n.t("Delete"),
            multiple: false,
            onClick: this.deleteNotification,
        },
        // View Summary
    ];

    render() {
        const { tableKey, toDelete } = this.state;
        const { d2, classes } = this.props;

        return (
            <React.Fragment>
                <ConfirmationDialog
                    isOpen={!!toDelete}
                    onSave={this.confirmDelete}
                    onCancel={this.cancelDelete}
                    title={i18n.t("Delete Instance?")}
                    description={i18n.t("Are you sure you want to delete this instance?")}
                    saveText={i18n.t("Ok")}
                />
                <PageHeader title={i18n.t("Notifications")} onBackClick={this.backHome} />
                <div className={classes.tableContainer}>
                    <ObjectsTable
                        key={tableKey}
                        d2={d2}
                        model={d2.models.dataSet}
                        columns={this.columns}
                        detailsFields={this.detailsFields}
                        pageSize={10}
                        initialSorting={this.initialSorting}
                        actions={this.actions}
                        list={SyncReport.list}
                    />
                </div>
            </React.Fragment>
        );
    }
}

export default withLoading(withSnackbar(withRouter(withStyles(styles)(NotificationsTable))));
