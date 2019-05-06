import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { ObjectsTable, withSnackbar, ConfirmationDialog } from "d2-ui-components";
import { withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";

import PageHeader from "../shared/PageHeader";

import Instance from "../../models/instance";

const styles = () => ({
    tableContainer: { marginTop: -10 },
});

class InstanceConfigurator extends React.Component {
    state = {
        tableKey: Math.random(),
        toDelete: null,
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
        this.props.history.push(`/instance-configurator/edit/${instance.id}`);
    };

    onTestConnection = async instanceData => {
        const instance = await Instance.build(instanceData);
        const connectionErrors = await instance.check();
        if (!connectionErrors.status) {
            this.props.snackbar.error(connectionErrors.error.message, {
                autoHideDuration: null,
            });
        } else {
            this.props.snackbar.success(i18n.t("Connected successfully to instance"));
        }
    };

    onDelete = instanceData => {
        this.setState({ toDelete: instanceData });
    };

    handleDialogCancel = () => {
        this.setState({ toDelete: null });
    };

    handleDialogConfirm = async () => {
        const { toDelete } = this.state;
        const instance = new Instance(toDelete);
        this.setState({ toDelete: null });
        await instance.remove(this.props.d2).then(response => {
            if (response.status) {
                this.props.snackbar.success(i18n.t("Deleted {{name}}", { name: toDelete.name }));

                // TODO: Add a way to force render of ObjectsTable on-demand
                // This is a work-around
                this.setState({ tableKey: Math.random() });
            } else {
                this.props.snackbar.error(
                    i18n.t("Failed to delete {{name}}", { name: toDelete.name })
                );
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
        {
            name: "testConnection",
            text: i18n.t("Test Connection"),
            multiple: false,
            onClick: this.onTestConnection,
            icon: "settings_input_antenna",
        },
    ];

    backHome = () => {
        this.props.history.push("/");
    };

    render() {
        const { d2, classes } = this.props;
        const { toDelete } = this.state;
        return (
            <React.Fragment>
                <ConfirmationDialog
                    isOpen={!!toDelete}
                    onSave={this.handleDialogConfirm}
                    onCancel={this.handleDialogCancel}
                    title={i18n.t("Delete Instance?")}
                    description={i18n.t("Are you sure you want to delete this instance?")}
                    saveText={i18n.t("Ok")}
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
