import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import i18n from "@dhis2/d2-i18n";
import { ObjectsTable, DatePicker } from "d2-ui-components";
import PageHeader from "../shared/PageHeader";

class BaseSyncConfigurator extends React.Component {
    state = {
        tableKey: Math.random(),
        filters: {
            date: null,
        },
    };

    static propTypes = {
        d2: PropTypes.object.isRequired,
        model: PropTypes.func.isRequired,
        history: PropTypes.object.isRequired,
        title: PropTypes.string.isRequired,
    };

    actions = [
        {
            name: "details",
            text: i18n.t("Details"),
            multiple: false,
            type: "details",
        },
    ];

    backHome = () => {
        this.props.history.push("/");
    };

    onDateChange = value => {
        this.setState({ filters: { date: value } });
    };

    renderCustomFilters = () => {
        const { date } = this.state.filters;
        return (
            <DatePicker
                placeholder={"Enter date"}
                value={date}
                onChange={this.onDateChange}
                isFilter
            />
        );
    };

    render() {
        const { d2, model, title } = this.props;

        // Wrapper method to preserve static context
        const list = (...params) => model.listMethod(...params);

        return (
            <React.Fragment>
                <PageHeader onBackClick={this.backHome} title={title} />
                <div style={{ marginTop: -10 }}>
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
                        customFiltersComponent={this.renderCustomFilters}
                        customFilters={this.state.filters}
                    />
                </div>
            </React.Fragment>
        );
    }
}

export default withRouter(BaseSyncConfigurator);
