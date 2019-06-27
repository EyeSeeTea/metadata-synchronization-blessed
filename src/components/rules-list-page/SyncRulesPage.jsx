import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";
import i18n from "@dhis2/d2-i18n";
import { ConfirmationDialog, ObjectsTable, withLoading, withSnackbar } from "d2-ui-components";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import PageHeader from "../page-header/PageHeader";
import SyncRule from "../../models/syncRule";
import Instance from "../../models/instance";
import { getValueForCollection } from "../../utils/d2-ui-components";
import { startSynchronization } from "../../logic/synchronization";
import SyncReport from "../../models/syncReport";
import SyncSummary from "../sync-summary/SyncSummary";

const styles = () => ({
    tableContainer: { marginTop: -10 },
});

class SyncRulesPage extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        snackbar: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
        loading: PropTypes.object.isRequired,
    };
    static model = {
        modelValidations: {
            // TODO: Update model validations
        },
    };

    state = {
        tableKey: Math.random(),
        toDelete: null,
        allInstances: [],
        syncReport: SyncReport.create(),
        syncSummaryOpen: false,
    };

    getValueForTargetInstances = ruleData => {
        const { allInstances } = this.state;
        const rule = SyncRule.build(ruleData);
        return getValueForCollection(
            rule.targetInstances
                .map(id => allInstances.find(instance => instance.id === id))
                .map(({ name }) => ({ name }))
        );
    };

    columns = [
        { name: "name", text: i18n.t("Name"), sortable: true },
        {
            name: "targetInstances",
            text: i18n.t("Destination instances"),
            sortable: false,
            getValue: this.getValueForTargetInstances,
        },
    ];

    initialSorting = ["name", "asc"];

    detailsFields = [
        { name: "name", text: i18n.t("Name") },
        { name: "description", text: i18n.t("Description") },
        {
            name: "targetInstances",
            text: i18n.t("Destination instances"),
            sortable: true,
            getValue: this.getValueForTargetInstances,
        },
    ];

    async componentDidMount() {
        const { d2 } = this.props;
        const { objects: allInstances } = await Instance.list(d2, null, null);
        this.setState({ allInstances });
    }

    backHome = () => {
        this.props.history.push("/");
    };

    deleteSyncRules = rules => {
        this.setState({ toDelete: rules });
    };

    cancelDelete = () => {
        this.setState({ toDelete: null });
    };

    confirmDelete = async () => {
        const { loading, d2 } = this.props;
        const { toDelete } = this.state;

        loading.show(true, i18n.t("Deleting Sync Rules"));
        const rules = toDelete.map(data => new SyncRule(data));

        const results = [];
        for (const rule of rules) {
            results.push(await rule.remove(d2));
        }

        loading.reset();
        this.setState({ tableKey: Math.random(), toDelete: null });

        if (_.some(results, ["status", false])) {
            this.props.snackbar.error(i18n.t("Failed to delete some rules"));
        } else {
            this.props.snackbar.success(
                i18n.t("Successfully deleted {{count}} rules", { count: toDelete.length })
            );
        }
    };

    createRule = () => {
        this.props.history.push("/synchronization-rules/new");
    };

    editRule = rule => {
        this.props.history.push(`/synchronization-rules/edit/${rule.id}`);
    };

    executeRule = async ({ builder, name }) => {
        const { d2, loading } = this.props;
        loading.show(true, i18n.t("Synchronizing metadata"));
        try {
            for await (const { message, syncReport, done } of startSynchronization(d2, builder)) {
                if (message) loading.show(true, message);
                if (syncReport) await syncReport.save(d2);
                if (done && syncReport) {
                    this.setState({ syncSummaryOpen: true, syncReport });
                }
            }
        } catch (error) {
            console.error(error);
            this.props.snackbar.error(i18n.t("Failed to execute rule {{name}}", { name }));
        }
        loading.reset();
    };

    closeSummary = () => this.setState({ syncSummaryOpen: false });

    actions = [
        {
            name: "edit",
            text: i18n.t("Edit"),
            multiple: false,
            onClick: this.editRule,
        },
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
            onClick: this.deleteSyncRules,
        },
        {
            name: "execute",
            text: i18n.t("Execute"),
            multiple: false,
            onClick: this.executeRule,
            icon: "settings_input_antenna",
        },
    ];

    render() {
        const { tableKey, toDelete, syncSummaryOpen, syncReport } = this.state;
        const { d2, classes } = this.props;

        return (
            <React.Fragment>
                <PageHeader title={i18n.t("Synchronization Rules")} onBackClick={this.backHome} />
                <div className={classes.tableContainer}>
                    <ObjectsTable
                        key={tableKey}
                        d2={d2}
                        model={SyncRulesPage.model}
                        columns={this.columns}
                        detailsFields={this.detailsFields}
                        pageSize={10}
                        initialSorting={this.initialSorting}
                        actions={this.actions}
                        list={SyncRule.list}
                        hideSearchBox={true}
                        onButtonClick={this.createRule}
                    />
                </div>

                <ConfirmationDialog
                    isOpen={!!toDelete}
                    onSave={this.confirmDelete}
                    onCancel={this.cancelDelete}
                    title={i18n.t("Delete Rules?")}
                    description={
                        toDelete
                            ? i18n.t("Are you sure you want to delete {{count}} rules?", {
                                  count: toDelete.length,
                              })
                            : ""
                    }
                    saveText={i18n.t("Ok")}
                />

                <SyncSummary
                    d2={d2}
                    response={syncReport}
                    isOpen={syncSummaryOpen}
                    handleClose={this.closeSummary}
                />
            </React.Fragment>
        );
    }
}

export default withLoading(withSnackbar(withRouter(withStyles(styles)(SyncRulesPage))));
