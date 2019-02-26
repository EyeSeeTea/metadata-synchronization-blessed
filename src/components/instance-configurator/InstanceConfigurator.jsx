import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { ObjectsTable, withSnackbar } from "d2-ui-components";
import { withRouter } from "react-router-dom";

import Instance from "../../models/instance";

class InstanceConfigurator extends React.Component {
    state = {
        tableKey: Math.random(),
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
            pathname: "/instance-configurator/new",
            instance
        });
    };

    onDelete = async instanceData => {
        const instance = new Instance(instanceData);
        await instance.remove(this.props.d2).then((response) => {
            if (response.status) {
                this.props.snackbar.success("Deleted " + instanceData.name);

                // TODO: Add a way to force render of ObjectsTable on-demand
                // This is a work-around
                this.setState({ tableKey: Math.random() });
            } else {
                this.props.snackbar.error("Failed to delete " + instanceData.name);
            }
        });
    };

    columns = [
        { name: "name", text: i18n.t("Server"), sortable: true },
        { name: "url", text: i18n.t("Url endpoint"), sortable: true },
        { name: "username", text: i18n.t("Username"), sortable: true },
    ];

    initialSorting = ["name", "asc"];

    detailsFields = [
        { name: "name", text: i18n.t("Name") },
        { name: "url", text: i18n.t("Url endpoint") },
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

    render() {
        const { d2 } = this.props;

        return (
            <div>
                <ObjectsTable
                    key={this.state.tableKey}
                    d2={d2}
                    model={d2.models.dataSet}
                    columns={this.columns}
                    detailsFields={this.detailsFields}
                    pageSize={20}
                    initialSorting={this.initialSorting}
                    actions={this.actions}
                    onCreate={this.onCreate}
                    list={Instance.list}
                />
            </div>
        );
    }
}

export default withSnackbar(withRouter(InstanceConfigurator));
