import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import i18n from "@dhis2/d2-i18n";
import { ConfirmationDialog, OldObjectsTable, withLoading, withSnackbar } from "d2-ui-components";
import { withRouter } from "react-router-dom";

import PageHeader from "../../components/page-header/PageHeader";
import Dropdown from "../../components/dropdown/Dropdown";
import SyncReport from "../../models/syncReport";
import SyncRule from "../../models/syncRule";
import SyncSummary from "../../components/sync-summary/SyncSummary";
import { getValueForCollection } from "../../utils/d2-ui-components";

const config = {
    metadata: {
        title: i18n.t("Metadata Synchronization History"),
    },
    aggregated: {
        title: i18n.t("Aggregated Synchronization History"),
    },
    events: {
        title: i18n.t("Events Synchronization History"),
    },
};

class HistoryPage extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        snackbar: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
    };

    static model = {
        modelValidations: {
            date: { type: "DATE" },
            metadata: { type: "COLLECTION" },
        },
    };

    state = {
        tableKey: Math.random(),
        toDelete: null,
        summaryOpen: false,
        syncReport: SyncReport.create(),
        statusFilter: "",
        syncRules: [],
    };

    initialSorting = ["date", "desc"];

    dropdownItems = [
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

        loading.show(true, i18n.t("Deleting History Notifications"));
        const notifications = toDelete.map(data => new SyncReport(data));

        const results = [];
        for (const notification of notifications) {
            results.push(await notification.remove(d2));
        }

        loading.reset();
        this.setState({ tableKey: Math.random(), toDelete: null });

        if (_.some(results, ["status", false])) {
            this.props.snackbar.error(i18n.t("Failed to delete some history notifications"));
        } else {
            this.props.snackbar.success(
                i18n.t("Successfully deleted {{count}} history notifications", {
                    count: toDelete.length,
                })
            );
        }
    };

    openSummary = data => {
        this.setState({ summaryOpen: true, syncReport: new SyncReport(data) });
    };

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

    closeSummary = () => {
        this.setState({ summaryOpen: false });
    };

    getMetadataTypes = notification => {
        return getValueForCollection(notification.types.map(type => ({ name: type })));
    };

    getSyncRuleEditLink = id => {
        const { syncRules } = this.state;
        const syncRule = syncRules.find(e => e.id === id);
        if (!syncRule) return null;

        return (
            <a
                href={`/#/metadata-synchronization-rules/edit/${syncRule.id}`}
                target="_blank"
                rel="noopener noreferrer"
            >
                Edit {syncRule.name}
            </a>
        );
    };

    detailsFields = [
        { name: "user", text: i18n.t("User") },
        { name: "date", text: i18n.t("Timestamp") },
        {
            name: "status",
            text: i18n.t("Status"),
            getValue: notification => _.startCase(_.toLower(notification.status)),
        },
        {
            name: "metadata",
            text: i18n.t("Metadata Types"),
            getValue: notification => this.getMetadataTypes(notification),
        },
        {
            name: "syncRule",
            text: i18n.t("Sync Rule"),
            getValue: ({ syncRule }) => this.getSyncRuleEditLink(syncRule),
        },
    ];

    getSyncRuleName = id => {
        const { syncRules } = this.state;
        const syncRule = syncRules.find(rule => rule.id === id) || {};
        return syncRule.name;
    };

    columns = [
        { name: "user", text: i18n.t("User"), sortable: true },
        { name: "date", text: i18n.t("Timestamp"), sortable: true },
        {
            name: "status",
            text: i18n.t("Status"),
            sortable: true,
            getValue: notification => _.startCase(_.toLower(notification.status)),
        },
        {
            name: "syncRule",
            text: i18n.t("Sync Rule"),
            sortable: true,
            getValue: ({ syncRule }) => this.getSyncRuleName(syncRule),
        },
    ];

    changeStatusFilter = event => {
        this.setState({ statusFilter: event.target.value });
    };

    renderCustomFilters = () => {
        const { statusFilter } = this.state;

        return (
            <Dropdown
                key={"level-filter"}
                items={this.dropdownItems}
                onChange={this.changeStatusFilter}
                value={statusFilter}
                label={i18n.t("Synchronization status")}
            />
        );
    };

    async componentDidMount() {
        const { d2, match } = this.props;
        const id = match.params.id;

        const { objects: syncRules } = await SyncRule.list(d2, null, { paging: false });
        const syncReport = !!id ? await SyncReport.get(d2, id) : null;

        this.setState({
            syncRules,
            syncReport: syncReport || SyncReport.create(),
            summaryOpen: !!syncReport,
        });
    }

    render() {
        const { tableKey, toDelete, syncReport, summaryOpen, statusFilter } = this.state;
        const { d2, match } = this.props;
        const { type } = match.params;
        const { title } = config[type];

        return (
            <React.Fragment>
                <PageHeader title={title} onBackClick={this.backHome} />
                <OldObjectsTable
                    key={tableKey}
                    d2={d2}
                    model={HistoryPage.model}
                    columns={this.columns}
                    detailsFields={this.detailsFields}
                    pageSize={10}
                    initialSorting={this.initialSorting}
                    actions={this.actions}
                    list={SyncReport.list}
                    hideSearchBox={true}
                    customFiltersComponent={this.renderCustomFilters}
                    customFilters={{ statusFilter, type }}
                />

                <SyncSummary
                    d2={d2}
                    response={syncReport}
                    isOpen={summaryOpen}
                    handleClose={this.closeSummary}
                />

                <ConfirmationDialog
                    isOpen={!!toDelete}
                    onSave={this.confirmDelete}
                    onCancel={this.cancelDelete}
                    title={i18n.t("Delete History Notifications?")}
                    description={
                        toDelete
                            ? i18n.t(
                                  "Are you sure you want to delete {{count}} history notifications?",
                                  {
                                      count: toDelete.length,
                                  }
                              )
                            : ""
                    }
                    saveText={i18n.t("Ok")}
                />
            </React.Fragment>
        );
    }
}

export default withLoading(withSnackbar(withRouter(HistoryPage)));
