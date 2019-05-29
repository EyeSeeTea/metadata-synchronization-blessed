import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import i18n from "@dhis2/d2-i18n";
import { ConfirmationDialog, ObjectsTable, withLoading, withSnackbar } from "d2-ui-components";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import PageHeader from "../shared/PageHeader";
import Dropdown from "../shared/Dropdown";
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
        statusFilter: {
            value: "",
            items: [],
        },
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
            multiple: false,
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

    componentDidMount = () => {
        const { value } = this.state.statusFilter;
        const items = [
            {
                id: "READY",
                name: i18n.t("Ready"),
            },
            {
                id: "RUNNING",
                name: i18n.t("Running"),
            },
            {
                id: "FAILURE",
                name: i18n.t("Failure"),
            },
            {
                id: "DONE",
                name: i18n.t("Done"),
            },
        ];
        this.setState({ statusFilter: { value, items } });
    };

    changeStatusFilter = event => {
        const { items } = this.state.statusFilter;
        this.setState({ statusFilter: { value: event.target.value, items } });
    };

    renderCustomFilters = () => {
        const { items, value } = this.state.statusFilter;

        return (
            <Dropdown
                key={"level-filter"}
                items={items}
                onChange={this.changeStatusFilter}
                value={value}
                label={i18n.t("Synchronization Status")}
            />
        );
    };

    render() {
        const { tableKey, toDelete, syncReport, summaryOpen, statusFilter } = this.state;
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
                        customFiltersComponent={this.renderCustomFilters}
                        customFilters={{ statusFilter: statusFilter.value }}
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
                    title={i18n.t("Delete Instance?")}
                    description={i18n.t("Are you sure you want to delete this instance?")}
                    saveText={i18n.t("Ok")}
                />
            </React.Fragment>
        );
    }
}

export default withLoading(withSnackbar(withRouter(withStyles(styles)(NotificationsTable))));
