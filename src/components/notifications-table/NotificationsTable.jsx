import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import i18n from "@dhis2/d2-i18n";
import { ObjectsTable, withSnackbar, withLoading, ConfirmationDialog } from "d2-ui-components";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import PageHeader from "../shared/PageHeader";

import SyncReport from "../../models/syncReport";
import SyncSummary from "../sync-summary/SyncSummary";

const styles = () => ({
    tableContainer: { marginTop: -10 },
});

class NotificationsTable extends React.Component {
    state = {
        tableKey: Math.random(),
        toDelete: null,
        summaryOpen: false,
        syncReport: SyncReport.create(),
    };

    static propTypes = {
        d2: PropTypes.object.isRequired,
        snackbar: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
    };

    static model = {
        modelValidations: {
            timestamp: { type: "DATE" },
            metadata: { type: "COLLECTION" },
        },
    };

    backHome = () => {
        this.props.history.push("/");
    };

    deleteNotification = notifications => {
        this.setState({ toDelete: notifications });
    };

    cancelDelete = () => {
        this.setState({ toDelete: null });
    };

    confirmDelete = async () => {
        const { loading, d2 } = this.props;
        const { toDelete } = this.state;

        loading.show(true, i18n.t("Deleting Notifications"));

        const promises = toDelete
            .map(reportData => new SyncReport(reportData))
            .map(report => report.remove(d2));

        const results = await Promise.all(promises);

        if (_.some(results, ["status", false])) {
            this.props.snackbar.error(i18n.t("Failed to delete some notifications"));
        } else {
            this.props.snackbar.success(
                i18n.t("Successfully deleted {{count}} notification", { count: toDelete.length })
            );
        }

        loading.reset();
        this.setState({ tableKey: Math.random(), toDelete: null });
    };

    openSummary = data => {
        this.setState({ summaryOpen: true, syncReport: new SyncReport(data) });
    };

    closeSummary = () => {
        this.setState({ summaryOpen: false });
    };

    // TODO: We should fix d2-ui-components instead
    getValueForCollection = values => {
        const namesToDisplay = _(values)
            .map(value => value.displayName || value.name || value.id)
            .compact()
            .value();

        return (
            <ul>
                {namesToDisplay.map(name => (
                    <li key={name}>{name}</li>
                ))}
            </ul>
        );
    };

    getMetadataTypes = notification => {
        return this.getValueForCollection(notification.selectedTypes.map(type => ({ name: type })));
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
        {
            name: "metadata",
            text: i18n.t("Metadata Types"),
            getValue: notification => this.getMetadataTypes(notification),
        },
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
            multiple: true,
            onClick: this.deleteNotification,
        },
        {
            name: "summary",
            text: i18n.t("View summary"),
            icon: "description",
            multiple: false,
            onClick: this.openSummary,
        },
    ];

    render() {
        const { tableKey, toDelete, syncReport, summaryOpen } = this.state;
        const { d2, classes } = this.props;

        return (
            <React.Fragment>
                <PageHeader title={i18n.t("Notifications")} onBackClick={this.backHome} />
                <div className={classes.tableContainer}>
                    <ObjectsTable
                        key={tableKey}
                        d2={d2}
                        model={NotificationsTable.model}
                        columns={this.columns}
                        detailsFields={this.detailsFields}
                        pageSize={10}
                        initialSorting={this.initialSorting}
                        actions={this.actions}
                        list={SyncReport.list}
                        hideSearchBox={true}
                    />
                </div>

                <SyncSummary
                    response={syncReport}
                    isOpen={summaryOpen}
                    handleClose={this.closeSummary}
                />

                <ConfirmationDialog
                    isOpen={!!toDelete}
                    onSave={this.confirmDelete}
                    onCancel={this.cancelDelete}
                    title={i18n.t("Delete Notifications?")}
                    description={
                        toDelete
                            ? i18n.t("Are you sure you want to delete {{count}} notification?", {
                                  count: toDelete.length,
                              })
                            : ""
                    }
                    saveText={i18n.t("Ok")}
                />
            </React.Fragment>
        );
    }
}

export default withLoading(withSnackbar(withRouter(withStyles(styles)(NotificationsTable))));
