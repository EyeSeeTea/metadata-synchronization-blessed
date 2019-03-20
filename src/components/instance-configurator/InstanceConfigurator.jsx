import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { ObjectsTable, withSnackbar } from "d2-ui-components";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import PageHeader from "../shared/PageHeader";
import ConfirmationDialog from "../confirmation-dialog/ConfirmationDialog";

import Instance from "../../models/instance";

const styles = () => ({
    tableContainer: { marginTop: -10 },
});

class InstanceConfigurator extends React.Component {
    state = {
        tableKey: Math.random(),
        dialogOpen: false,
        toDelete: {},
    };

    static propTypes = {
        d2: PropTypes.object.isRequired,
        snackbar: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
    };

    onCreate = () => {
        this.props.history.push("/instance-configurator/new");
    };

    onEdit = instance => {
        this.props.history.push({
            pathname: "/instance-configurator/edit",
            instance,
        });
    };

    onDelete = instanceData => {
        this.setState({ dialogOpen: true, toDelete: instanceData });
    };

    handleDialogCancel = () => {
        this.setState({ dialogOpen: false, toDelete: {} });
    };

    handleDialogConfirm = async () => {
        const { toDelete } = this.state;
        const instance = new Instance(toDelete);
        this.setState({ dialogOpen: false });
        await instance.remove(this.props.d2).then(response => {
            if (response.status) {
                this.props.snackbar.success("Deleted " + toDelete.name);

                // TODO: Add a way to force render of ObjectsTable on-demand
                // This is a work-around
                this.setState({ tableKey: Math.random() });
            } else {
                this.props.snackbar.error("Failed to delete " + toDelete.name);
            }
        });
    };

    columns = [
        { name: "name", text: i18n.t("Server name"), sortable: true },
        { name: "url", text: i18n.t("URL endpoint"), sortable: true },
        { name: "username", text: i18n.t("Username"), sortable: true },
    ];

    initialSorting = ["id", "asc"];

    detailsFields = [
        { name: "name", text: i18n.t("Server name") },
        { name: "url", text: i18n.t("URL endpoint") },
        { name: "username", text: i18n.t("Username") },
        { name: "description", text: i18n.t("Description") },
    ];

    actions = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
            type: "details",
        },
        {
            name: "edit",
            text: i18n.t("Edit"),
            multiple: false,
            onClick: this.onEdit,
        },
        {
            name: "delete",
            text: i18n.t("Delete"),
            multiple: false,
            onClick: this.onDelete,
        },
    ];

    backHome = () => {
        this.props.history.push("/");
    };

    render() {
        const { d2, classes } = this.props;
        const { dialogOpen } = this.state;
        return (
            <React.Fragment>
                <ConfirmationDialog
                    dialogOpen={dialogOpen}
                    handleConfirm={this.handleDialogConfirm}
                    handleCancel={this.handleDialogCancel}
                    title={i18n.t("Delete Instance?")}
                    contents={i18n.t("All your changes will be lost. Are you sure?")}
                />
                <PageHeader title={i18n.t("Instances")} onBackClick={this.backHome} />
                <div className={classes.tableContainer}>
                    <ObjectsTable
                        key={this.state.tableKey}
                        d2={d2}
                        model={d2.models.dataSet}
                        columns={this.columns}
                        detailsFields={this.detailsFields}
                        pageSize={10}
                        initialSorting={this.initialSorting}
                        actions={this.actions}
                        onCreate={this.onCreate}
                        list={Instance.list}
                    />
                </div>
            </React.Fragment>
        );
    }
}

export default withSnackbar(withRouter(withStyles(styles)(InstanceConfigurator)));
