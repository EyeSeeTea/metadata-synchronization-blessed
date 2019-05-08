import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { ObjectsTable, withSnackbar } from "d2-ui-components";
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
    };

    static propTypes = {
        d2: PropTypes.object.isRequired,
        snackbar: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
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
        // View Summary
        // Delete
    ];

    backHome = () => {
        this.props.history.push("/");
    };

    render() {
        const { tableKey } = this.state;
        const { d2, classes } = this.props;

        return (
            <React.Fragment>
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

export default withSnackbar(withRouter(withStyles(styles)(NotificationsTable)));
