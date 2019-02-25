import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { ObjectsTable } from "d2-ui-components";

import Instance from "../../models/instance";

class InstanceConfigurator extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    columns = [
        {name: "name", text: i18n.t("Server"), sortable: true},
        {name: "url", text: i18n.t("Endpoint"), sortable: true},
        {name: "username", text: i18n.t("Username"), sortable: true}
    ];

    // TODO: Make initialSorting optional, and default to first column, asc on d2-ui-components
    initialSorting = ["name", "asc"];

    detailsFields = [
        {name: "name", text: i18n.t("Name")},
        {name: "url", text: i18n.t("Endpoint")},
        {name: "username", text: i18n.t("Username")},
        {name: "description", text: i18n.t("Description")},
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
            onClick: dataSet => console.log("TODO:edit", dataSet),
        },
        {
            name: "delete",
            text: i18n.t("Delete"),
            multiple: true,
        }
    ];

    onCreate = () => {
        this.props.history.push("/instance-configurator/new");
    };

    render() {
        const {d2} = this.props;

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

export default InstanceConfigurator;
