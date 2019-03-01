import React from "react";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import { ObjectsTable } from "d2-ui-components";

export default class BaseSyncConfigurator extends React.Component {
    state = {
        tableKey: Math.random(),
    };

    static propTypes = {
        d2: PropTypes.object.isRequired,
        model: PropTypes.func.isRequired,
    };

    actions = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
            type: "details",
        },
    ];

    render() {
        const { d2, model } = this.props;

        // Wrapper method to preserve static context
        const list = (...params) => model.listMethod(...params);

        return (
            <div>
                <ObjectsTable
                    key={this.state.tableKey}
                    d2={d2}
                    model={model.getD2Model(d2)}
                    columns={model.getColumns()}
                    detailsFields={model.getDetails()}
                    pageSize={20}
                    initialSorting={model.getInitialSorting()}
                    actions={this.actions}
                    list={list}
                />
            </div>
        );
    }
}
