import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { ObjectsTable, withSnackbar } from "d2-ui-components";
import { withRouter } from "react-router-dom";

import Instance from "../../models/instance";

class InstanceConfigurator extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
        snackbar: PropTypes.object.isRequired,
        history: PropTypes.object.isRequired,
    };

    onCreate = () => {
        this.props.history.push("/instance-configurator/new");
    };

    onEdit = instance => {
        console.log("TODO:Edit", instance);
        this.props.snackbar.info("TODO: Edit " + instance.name);
    };

    onDelete = instance => {
        console.log("TODO:Delete", instance);
        this.props.snackbar.info("TODO: Delete " + instance.name);
    };

    columns = [
        { name: "name", text: i18n.t("Server"), sortable: true },
        { name: "url", text: i18n.t("Endpoint"), sortable: true },
        { name: "username", text: i18n.t("Username"), sortable: true },
    ];

    initialSorting = ["name", "asc"];

    detailsFields = [
        { name: "name", text: i18n.t("Name") },
        { name: "url", text: i18n.t("Endpoint") },
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
            multiple: true,
            onClick: this.onDelete,
        },
    ];

    render() {
        const { d2 } = this.props;

        return (
            <div>
                <ObjectsTable
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
