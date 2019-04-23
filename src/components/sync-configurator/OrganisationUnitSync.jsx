import React from "react";
import BaseSyncConfigurator from "./BaseSyncConfigurator";
import PropTypes from "prop-types";
import i18n from "@dhis2/d2-i18n";
import memoize from "nano-memoize";
import { OrganisationUnitModel } from "../../models/d2Model";
import Dropdown from "../shared/Dropdown";
import { d2ModelFactory } from "../../models/d2ModelFactory";

export default class OrganisationUnitSync extends React.Component {
    static propTypes = {
        d2: PropTypes.object.isRequired,
    };

    state = {
        orgUnitLevelFilter: {
            value: "",
            items: [],
        },
    };

    getExtraFilterState = memoize(orgUnitLevelFilterValue => ({
        orgUnitLevel: orgUnitLevelFilterValue,
    }));

    componentDidMount() {
        this.getDropdownData();
    }

    getDropdownData = async () => {
        const { d2 } = this.props;

        const orgUnitLevelsClass = d2ModelFactory(d2, "organisationUnitLevels");
        const orgUnitLevelsList = await orgUnitLevelsClass.listMethod(
            d2,
            { customFields: ["level", "name"] },
            { paging: false, sorting: ["level", "asc"] }
        );
        const orgUnitLevels = orgUnitLevelsList.objects.map(e => ({
            id: e.level,
            name: `${e.level}. ${e.name}`,
        }));
        const orgUnitLevelFilter = { ...this.state.orgUnitLevelFilter, items: orgUnitLevels };

        this.setState({ orgUnitLevelFilter });
    };

    changeLevelFilter = event => {
        const { items } = this.state.orgUnitLevelFilter;
        this.setState({ orgUnitLevelFilter: { value: event.target.value, items } });
    };

    renderExtraFilters = () => {
        const { orgUnitLevelFilter } = this.state;
        return [
            <Dropdown
                key={"level-filter"}
                items={orgUnitLevelFilter.items}
                onChange={this.changeLevelFilter}
                value={orgUnitLevelFilter.value}
                label={i18n.t("Organisation Level")}
            />,
        ];
    };

    render() {
        const { orgUnitLevelFilter } = this.state;

        const title = i18n.t("Organisation Units Synchronization");
        const extraFiltersState = this.getExtraFilterState(orgUnitLevelFilter.value);

        return (
            <BaseSyncConfigurator
                model={OrganisationUnitModel}
                title={title}
                groupFilterName={"organisationUnitGroups"}
                renderExtraFilters={this.renderExtraFilters}
                extraFiltersState={extraFiltersState}
                {...this.props}
            />
        );
    }
}
